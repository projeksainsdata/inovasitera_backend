// models/ImageMetadata.js
import mongoose from 'mongoose';

const FileMetadataSchema = new mongoose.Schema({
  imageId: {
    type: String,
    required: true,
    unique: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  originalFilename: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  s3Key: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const FileMetadata = mongoose.model('FileMetadata', FileMetadataSchema);

export default FileMetadata;
