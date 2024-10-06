import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const model = mongoose.model;

const ratingSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FaQSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const inovatationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categories',
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'rejected'],
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
    thumbnail: {
      type: String,
      required: false,
    },
    adventage: {
      type: String,
      required: false,
    },
    status_paten: {
      type: String,
      required: false,
    },
    score_tkt: {
      type: String,
      required: false,
    },
    collaboration: {
      type: [String],
      required: false,
    },
    collaboration_details: {
      type: String,
      required: false,
    },
    development_stage: {
      type: String,
      required: false,
    },
    rating: [ratingSchema],
    faq: [FaQSchema],
  },
  {timestamps: true},
);

// Middleware to handle cascading deletes
inovatationSchema.pre('remove', async function (next) {
  try {
    const inovationId = this._id;

    // Delete related discussions
    await mongoose.model('Discussions').deleteMany({inovation_id: inovationId});

    // Delete related whitelists
    await mongoose.model('Whitelists').deleteMany({inovation_id: inovationId});

    // Note: We're not deleting User documents, but you might want to update them
    // For example, you could remove this inovation from any user's list of inovations
    // await mongoose.model('Users').updateMany(
    //   { 'inovator.inovations': inovationId },
    //   { $pull: { 'inovator.inovations': inovationId } }
    // );

    next();
  } catch (error) {
    next(error);
  }
});

const Inovatation = model('Inovations', inovatationSchema);

export default Inovatation;
