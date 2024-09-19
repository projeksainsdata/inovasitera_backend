import mongoose from 'mongoose'

// convert string to ObjectId
const toObjectId = (ids) => {
  if (ids?.constructor === Array) {
    return ids.map(mongoose.Types.ObjectId)
  }

  return mongoose.Types.ObjectId(ids)
}

export const isObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

export default toObjectId
