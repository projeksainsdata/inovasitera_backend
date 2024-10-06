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

// Virtual for replies
discussionSchema.virtual('replies', {
  ref: 'Discussions',
  localField: '_id',
  foreignField: 'parent_discussion_id',
});

// Middleware to delete all child discussions when a parent is deleted
discussionSchema.pre('remove', async function (next) {
  try {
    // Find all child discussions
    const childDiscussions = await this.model('Discussions').find({
      parent_discussion_id: this._id,
    });

    // Remove each child discussion
    for (const child of childDiscussions) {
      await child.remove();
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Discussion = model('Discussions', discussionSchema);

export default Discussion;
