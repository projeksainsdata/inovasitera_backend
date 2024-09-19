import mongoose from 'mongoose';
import uuidV4 from '../utils/uuid.js';
import dateExpired from '../helpers/dateExpired.js';
import config from '../config/config.js';

// this is the refresh token model for refresh token jwt token
const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  expiryDate: {
    type: Date,
    expires: Number(config.jwt.refreshExpiration) / 1000,
  },
});

RefreshTokenSchema.statics.createToken = async function (user_id) {
  let expiredAt = new Date(dateExpired(Number(config.jwt.refreshExpiration)));
  let _token = uuidV4();

  let _object = new this({
    token: _token,
    user: user_id,
    expiryDate: expiredAt.getTime(),
  });

  let refreshToken = await _object.save();
  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate < new Date().getTime();
};

// auto delete token when expire with expireAfterSeconds
RefreshTokenSchema.index({createdAt: 1}, {expireAfterSeconds: 0});
// create index token
RefreshTokenSchema.index({token: 1});

// remove auto when expired
const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

export default RefreshToken;
