import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const model = mongoose.model;

const categorySchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    autoSearchIndex: true,
  },
);

categorySchema.index({name: 1}, {unique: true});

// weight is used for sorting and querying

categorySchema.index({weight: 1});

// Middleware to handle cascading deletes
categorySchema.pre('remove', async function (next) {
  try {
    // delete all inovations that have this category
    await this.model('Inovations').deleteMany({category: this._id});

    next();
  } catch (error) {
    next(error);
  }
});

const Category = model('Categories', categorySchema);

Category.createIndexes();
export default Category;
