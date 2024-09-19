import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const model = mongoose.model;

const discussionSchema = new Schema(
  {
    inovation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inovations',
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    content: {
      type: String,
      required: true,
    },
    parent_discussion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussions',
      default: null,
    },
  },
  {timestamps: true},
);

discussionSchema.virtual('replies', {
  ref: 'Discussions',
  localField: '_id',
  foreignField: 'parent_discussion_id',
});

const Discussion = model('Discussions', discussionSchema);

export default Discussion;
