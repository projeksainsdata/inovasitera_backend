import mongoose from 'mongoose'

const Schema = mongoose.Schema
const model = mongoose.model

const ratingSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  inovation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inovations',
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const RatingModel = model('Ratings', ratingSchema)

export default RatingModel
