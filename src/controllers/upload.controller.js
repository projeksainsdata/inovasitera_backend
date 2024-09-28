import {
  validateUploadToken,
  processUpload,
  storageService,
} from '../services/upload.service.js';
import FilesMeta from '../models/filesMeta.model.js';
import ResponseError from '../responses/error.response.js';
import ResponseApi from '../responses/api.response.js';
import multer from 'multer';

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

  upload = async (req, res, next) => {
    try {
      const uploadToken = req.headers['x-upload-token'];

      if (!validateUploadToken(uploadToken)) {
        throw new ResponseError('Invalid upload token', 403);
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

      return ResponseApi.created(res, {fileName, fileUrl});
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
}
