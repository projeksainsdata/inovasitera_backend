import {
  validateAndConsumeUploadToken,
  storageService,
  generateUploadToken as generateUploadTokenService,
} from '../services/upload.service.js';
import FilesMeta from '../models/files.model.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import multer from 'multer';
import config from '../config/config.js';
import {promisify} from 'util';
import {URL} from 'url';

const createMulterMiddleware = (fileSizeLimit) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'storage');
      },
      filename: (req, file, cb) => {
        // Generate a unique file name with timestamp and random number appended with end with extension using mimetype
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.mimetype.split('/')[1]}`;
        cb(null, uniqueSuffix);
      },
    }),

    limits: {fileSize: fileSizeLimit},
  });
};

export default class UploadController {
  constructor() {
    this.storageService = storageService;
  }

  generateUploadToken = async (req, res, next) => {
    try {
      const user = req.user;

      const {fileType, maxSizeBytes} = req.body;

      // Validate input
      if (!fileType) {
        throw new ResponseError('File type is required', 400);
      }

      if (
        !maxSizeBytes ||
        typeof maxSizeBytes !== 'number' ||
        maxSizeBytes <= 0 ||
        maxSizeBytes > config.upload.maxFileSize
      ) {
        throw new ResponseError('Invalid max size bytes', 400);
      }

      // Generate upload token
      const uploadToken = await generateUploadTokenService(
        user.id,
        fileType,
        maxSizeBytes,
      );

      const uploadUrl = new URL('/api/v1/uploads', config.api.baseUrl);
      uploadUrl.searchParams.append('token', uploadToken);

      return ResponseApi.success(res, {
        token: uploadToken,
        url: uploadUrl.href,
      });
    } catch (error) {
      next(error);
    }
  };

  upload = async (req, res, next) => {
    try {
      const token = req.query.token;

      if (!token) {
        throw new ResponseError('Upload token is required', 400);
      }

      const tokenData = await validateAndConsumeUploadToken(token);
      if (!tokenData) {
        throw new ResponseError('Invalid or expired upload token', 403);
      }

      const multerMiddleware = createMulterMiddleware(
        tokenData.maxSizeBytes * 1024,
      );

      await promisify(multerMiddleware.single('image'))(req, res);

      if (!req.file) {
        throw new ResponseError('File is required', 400);
      }

      const fileName = req.file.filename;
      const filePath = req.file.path;
      const fileUrl = this.storageService.getFileUrl(fileName);
      // Store metadata in database
      const metadata = {
        fileName,
        filePath,
        fileUrl,
        userId: tokenData.userId,
        uploadedAt: new Date(),
      };
      await FilesMeta.create(metadata);

      return ResponseApi.created(res, {fileName, fileUrl});
    } catch (error) {
      next(error);
    }
  };

  uploadBatch = async (req, res, next) => {
    try {
      const uploadToken = req.headers['x-upload-token'];

      if (!uploadToken) {
        throw new ResponseError('Upload token is required', 400);
      }

      const tokenData = await validateAndConsumeUploadToken(uploadToken);
      if (!tokenData) {
        throw new ResponseError('Invalid or expired upload token', 403);
      }

      const multerMiddleware = createMulterMiddleware(
        tokenData.maxSizeBytes,
        tokenData.fileType,
      );

      await promisify(multerMiddleware.array('images', config.upload.maxFiles))(
        req,
        res,
      );

      if (!req.files || req.files.length === 0) {
        throw new ResponseError('At least one file is required', 400);
      }

      const uploadedFiles = [];
      for (const file of req.files) {
        const fileName = file.filename;
        const filePath = file.path;
        const fileUrl = this.storageService.getFileUrl(fileName);
        // Store metadata in database
        const metadata = {
          fileName,
          filePath,
          fileUrl,
          userId: tokenData.userId,
          uploadedAt: new Date(),
        };
        await FilesMeta.create(metadata);

        uploadedFiles.push({fileName, fileUrl});
      }

      return ResponseApi.created(res, uploadedFiles);
    } catch (error) {
      next(error);
    }
  };

  download = async (req, res, next) => {
    try {
      const {fileName} = req.params;

      if (!fileName) {
        throw new ResponseError('File name is required', 400);
      }

      const file = await FilesMeta.findOne({fileName});
      if (!file) {
        throw new ResponseError('File not found', 404);
      }

      res.download(file.filePath, file.fileName, (err) => {
        if (err) {
          next(new ResponseError('Error downloading file', 500));
        }
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const {fileName} = req.params;

      if (!fileName) {
        throw new ResponseError('File name is required', 400);
      }

      const file = await FilesMeta.findOne({fileName});
      if (!file) {
        throw new ResponseError('File not found', 404);
      }

      await this.storageService.deleteFile(fileName);
      await FilesMeta.deleteOne({fileName});

      return ResponseApi.success(res, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
