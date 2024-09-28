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

const Category = model('Categories', categorySchema);

Category.createIndexes();
export default Category;
