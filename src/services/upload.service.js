// services/uploadService.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import uuidv4 from '../utils/uuid.js';
import FileMetadata from '../models/files.model.js';
import {
  validateFileType,
  validateMetadata,
} from '../validate/upload.validate.js';
import {generateUploadToken, verifyUploadToken} from '../utils/jwtUtils.js';
import ResponseError from '../responses/error.response.js';
import config from '../config/config.js';

class UploadService {
  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
    this.bucketName = config.aws.bucket;
  }

  async generateUploadToken(userId) {
    return generateUploadToken(userId);
  }

  async validateUploadToken(token) {
    return verifyUploadToken(token);
  }

  async generatePresignedUrl(fileType, token) {
    const userId = await this.validateUploadToken(token);

    if (!validateFileType(fileType)) {
      throw new ResponseError(400, 'Invalid file type');
    }

    const imageId = uuidv4();
    const key = `${imageId}.${fileType}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: `image/${fileType}`,
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });
      return {uploadUrl, imageId, key, userId};
    } catch {
      throw new ResponseError(500, 'Failed to generate presigned URL');
    }
  }

  async confirmUpload(imageId, metadata, userId) {
    if (!validateMetadata(metadata)) {
      throw new ResponseError(400, 'Invalid metadata');
    }

    try {
      // Verify the file exists in S3
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: `${imageId}.${metadata.contentType.split('/')[1]}`,
      });
      await this.s3Client.send(headCommand);

      const newImage = new FileMetadata({
        imageId,
        uploadedBy: userId,
        originalFilename: metadata.filename,
        contentType: metadata.contentType,
        size: metadata.size,
        uploadedAt: new Date(),
        s3Key: `${imageId}.${metadata.contentType.split('/')[1]}`,
        url: `https://${this.bucketName}.s3.amazonaws.com/${imageId}.${metadata.contentType.split('/')[1]}`,
      });

      await newImage.save();
      return {success: true, imageId};
    } catch {
      throw new ResponseError(500, 'Failed to confirm upload');
    }
  }

  async deleteImage(imageId, userId) {
    try {
      const image = await FileMetadata.findOne({imageId, uploadedBy: userId});
      if (!image) {
        throw new ResponseError(404, 'Image not found');
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: image.s3Key,
      });
      await this.s3Client.send(deleteCommand);

      await FileMetadata.deleteOne({imageId});

      return {success: true, message: 'Image deleted successfully'};
    } catch {
      throw new ResponseError(500, 'Failed to delete image');
    }
  }
}

export default new UploadService();
