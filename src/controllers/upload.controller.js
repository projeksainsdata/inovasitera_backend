// routes/uploadRoutes.js
import uploadService from '../services/upload.service.js';
import ResponseApi from '../responses/api.response.js';

class UploadController {
  async generateUploadToken(req, res, next) {
    try {
      const token = await uploadService.generateUploadToken(req.user._id);
      return ResponseApi.success(res, {token});
    } catch (error) {
      return next(error);
    }
  }

  async requestPresignedUrl(req, res, next) {
    try {
      const {fileType, token} = req.body;
      const {uploadUrl, imageId} = await uploadService.generatePresignedUrl(
        fileType,
        token,
      );
      return ResponseApi.success(res, {uploadUrl, imageId});
    } catch (error) {
      return next(error);
    }
  }

  async confirmUpload(req, res, next) {
    try {
      const {imageId, metadata} = req.body;
      const result = await uploadService.confirmUpload(
        imageId,
        metadata,
        req.user._id,
      );
      return ResponseApi.success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const result = await uploadService.deleteImage(
        req.params.imageId,
        req.user._id,
      );
      return ResponseApi.noContent(res, result);
    } catch (error) {
      return next(error);
    }
  }
}

export default UploadController;
