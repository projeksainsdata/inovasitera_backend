import mongoose from 'mongoose'

const whitelistSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Whitelist = mongoose.model('Whitelists', whitelistSchema)

export default Whitelist
