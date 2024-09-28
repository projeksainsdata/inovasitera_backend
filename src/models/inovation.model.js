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
    Image: {
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

    invesment_value: {
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

    rating: [ratingSchema],
  },
  {timestamps: true},
);

const Inovatation = model('Inovations', inovatationSchema);

export default Inovatation;
