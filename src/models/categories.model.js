import mongoose from 'mongoose'

const Schema = mongoose.Schema
const model = mongoose.model

const categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  }
})

categorySchema.index({ name: 1 }, { unique: true })

const Category = model('Categories', categorySchema)

Category.createIndexes()
export default Category
