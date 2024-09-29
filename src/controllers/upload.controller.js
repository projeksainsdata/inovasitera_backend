import {
  validateAndConsumeUploadToken,
  processUpload,
  storageService,
} from '../services/upload.service.js';
import FilesMeta from '../models/files.model.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import multer from 'multer';
import config from '../config/config.js';
export const upload = multer({
  storage: multer.memoryStorage(),

  limits: {fileSize: 1024 * 1024 * 4},

  fileFilter: (req, file, cb) => {
    // only accept image files
    if (!file.mimetype.startsWith('image')) {
      return cb(new ResponseError('Only image files are allowed', 400));
    }
    cb(null, true);
  },
});

export default class UploadController {
  constructor() {
    this.storageService = storageService;
  }

  generateUploadToken = async (req, res, next) => {
    try {
      const user = req.user;
      // userId, fileType, maxSizeBytes
      const {fileType, maxSizeBytes} = req.body;
      if (!fileType) {
        throw new ResponseError('File type is required', 400);
      }

      if (!maxSizeBytes) {
        throw new ResponseError('Max size bytes is required', 400);
      }

      const uploadToken = await this.storageService.generateUploadToken(
        user.id,
        fileType,
        maxSizeBytes,
      );
      return ResponseApi.success(res, {
        token: uploadToken,
        url: config.api.baseUrl + 'api/v1/upload?token=' + uploadToken,
      });
    } catch (error) {
      next(error);
    }
  };

  upload = async (req, res, next) => {
    try {
      // get token from url
      const token = req.query.token;
      const tokenData = validateAndConsumeUploadToken(token);
      if (!tokenData) {
        throw new ResponseError('Invalid upload token', 403);
      }
      // Validate file type and size
      if (req.file.mimetype !== tokenData.fileType) {
        throw new ResponseError('Invalid file type', 400);
      }
      if (req.file.size > tokenData.maxSizeBytes) {
        throw new ResponseError('File size exceeded', 400);
      }

      const {fileName, filePath, fileUrl} = await processUpload(req.file);
      // Store metadata in database
      // This is just a placeholder. You'd typically use your Mongoose model here.
      const metadata = {
        fileName,
        filePath,
        fileUrl,
        userId: req.user.id, // Assuming you have user info from auth middleware
        uploadedAt: new Date(),
      };
      // Save metadata to database
      await FilesMeta.create(metadata);

      return ResponseApi.created(res, {fileName, fileUrl, filePath});
    } catch (error) {
      next(error);
    }
  };

  uploadBatch = async (req, res, next) => {
    try {
      const uploadToken = req.headers['x-upload-token'];

      if (!validateAndConsumeUploadToken(uploadToken)) {
        throw new ResponseError('Invalid upload token', 403);
      }

      const files = req.files;

      const uploadedFiles = [];

      for (const file of files) {
        const {fileName, filePath, fileUrl} = await processUpload(file);
        // Store metadata in database
        // This is just a placeholder. You'd typically use your Mongoose model here.
        const metadata = {
          fileName,
          filePath,
          fileUrl,
          userId: req.user.id, // Assuming you have user info from auth middleware
          uploadedAt: new Date(),
        };
        // Save metadata to database
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
      const file = await FilesMeta.findOne({
        fileName,
      });
      if (!file) {
        throw new ResponseError('File not found', 404);
      }

      const filePath = file.filePath;
      res.download(filePath);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const {fileName} = req.params;
      const file = await FilesMeta.findOne({
        fileName,
      });
      if (!file) {
        throw new ResponseError('File not found', 404);
      }

      await FilesMeta.deleteOne({
        fileName,
      });

      return ResponseApi.success(res, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
