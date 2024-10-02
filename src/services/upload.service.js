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
    try {
      return generateUploadToken(userId);
    } catch {
      throw new ResponseError('Failed to generate upload token', 500);
    }
  }

  async validateUploadToken(token) {
    try {
      return verifyUploadToken(token);
    } catch {
      throw new ResponseError('Invalid upload token', 400);
    }
  }

  async generatePresignedUrl(fileType, token) {
    try {
      const userId = await this.validateUploadToken(token);

      if (!validateFileType(fileType)) {
        throw new ResponseError('Invalid file type', 400);
      }

      const imageId = uuidv4();
      const key = `${imageId}.${fileType}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: `${fileType}`,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });
      return {uploadUrl, imageId, key, userId};
    } catch {
      throw new ResponseError('Failed to generate presigned URL', 500);
    }
  }

  async confirmUpload(imageId, metadata, userId) {
    try {
      if (!validateMetadata(metadata)) {
        throw new ResponseError('Invalid metadata', 400);
      }

      // Verify the file exists in S3
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: `${imageId}.${metadata.contentType}`,
      });
      await this.s3Client.send(headCommand);

      const newImage = new FileMetadata({
        imageId,
        uploadedBy: userId,
        originalFilename: metadata.filename,
        contentType: metadata.contentType,
        size: metadata.size,
        uploadedAt: new Date(),
        s3Key: `${imageId}.${metadata.contentType}`,
        url: `https://${this.bucketName}.s3.amazonaws.com/${imageId}.${metadata.contentType}`,
      });

      await newImage.save();
      return {
        success: true,
        message: 'Image uploaded successfully',
        url: newImage.url,
      };
    } catch {
      throw new ResponseError('Failed to confirm upload', 500);
    }
  }

  async generatePresignedUrls(fileTypes, token) {
    if (fileTypes.length > 10) {
      throw new ResponseError('Maximum 10 images allowed', 400);
    }

    const userId = await this.validateUploadToken(token);

    const presignedUrls = await Promise.all(
      fileTypes.map(async (fileType) => {
        const imageId = uuidv4();
        const key = `${imageId}.${fileType}`;
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          ContentType: `${fileType}`,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: 300,
        });

        return {uploadUrl, imageId, key, fileType, userId};
      }),
    );

    return presignedUrls;
  }

  async confirmBatchUpload(uploadedImages, userId) {
    const images = await Promise.all(
      uploadedImages.map(async (image) => {
        if (!validateMetadata(image.metadata)) {
          throw new ResponseError('Invalid metadata', 400);
        }

        const headCommand = new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: `${image.imageId}.${image.metadata.contentType}`,
        });
        await this.s3Client.send(headCommand);

        const newImage = new FileMetadata({
          imageId: image.imageId,
          uploadedBy: userId,
          originalFilename: image.metadata.filename,
          contentType: image.metadata.contentType,
          size: image.metadata.size,
          uploadedAt: new Date(),
          s3Key: `${image.imageId}.${image.metadata.contentType}`,
          url: `https://${this.bucketName}.s3.amazonaws.com/${image.imageId}.${image.metadata.contentType}`,
        });

        await newImage.save();
        return {
          url: newImage.url,
        };
      }),
    );

    return {
      success: true,
      message: 'Images uploaded successfully',
      images,
    };
  }

  async deleteImage(imageId, userId) {
    try {
      const image = await FileMetadata.findOne({imageId, uploadedBy: userId});
      if (!image) {
        throw new ResponseError('Image not found', 404);
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: image.s3Key,
      });
      await this.s3Client.send(deleteCommand);

      await FileMetadata.deleteOne({imageId});

      return {success: true, message: 'Image deleted successfully'};
    } catch {
      throw new ResponseError('Failed to delete image', 500);
    }
  }
}

export default new UploadService();
