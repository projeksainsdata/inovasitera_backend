import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const model = mongoose.model;

const FilesMetaSchema = new Schema(
  {
    // const metadata = {
    //     fileName,
    //     filePath,
    //     fileUrl,
    //     userId: req.user.id, // Assuming you have user info from auth middleware
    //     uploadedAt: new Date()
    //   };
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    timestamps: true,
    autoSearchIndex: true,
  },
);

const FilesMeta = model('FilesMeta', FilesMetaSchema);

FilesMeta.createIndexes();

export default FilesMeta;
