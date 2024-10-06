import mongoose from 'mongoose';
import ROLE from '../enum/role.enum.js';

const Schema = mongoose.Schema;
const model = mongoose.model;

const profile_imgs_collections_list = ['shapes'];

const profile_imgs_name_list = [
  'ellipse',
  'ellipseFilled',
  'line',
  'polygon',
  'polygonFilled',
  'rectangle',
  'rectangleFilled',
];

const userSchema = new Schema({
  role: {
    type: String,
    default: ROLE.MEMBER,
    enum: [ROLE.ADMIN, ROLE.INOVATOR, ROLE.MEMBER],
  },
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  provider: {
    type: String,
    default: 'local',
  },

  profile: {
    type: String,
    // get a random profile image from dicebear

    default: () => {
      return `https://api.dicebear.com/9.x/${
        profile_imgs_collections_list[
          Math.floor(Math.random() * profile_imgs_collections_list.length)
        ]
      }/svg?seed=${
        profile_imgs_name_list[
          Math.floor(Math.random() * profile_imgs_name_list.length)
        ]
      }`;
    },
  },

  address: {
    type: String,
    default: '',
  },
  phonenumber: {
    type: String,
    default: '', // make new user
  },
  dateOfBirth: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },

  //  password management
  forgotPassword: {
    type: String,
    default: '',
  },
  resetPassword: {
    type: String,
    default: '',
  },

  //  email verification
  emailVerify: {
    type: String,
    default: '',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },

  inovator: {
    unit: {
      type: String,
      default: '',
    },
    fields: {
      type: Array,
      default: [],
    },
    fakultas: {
      type: String,
      default: '',
    },
    prodi: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'pending',
    },
  },
});

userSchema.index(
  {
    email: 1,
    username: 1,
  },
  {
    unique: true,
  },
);

userSchema.pre('remove', async function (next) {
  try {
    // delete all inovations that have this user
    await this.model('Inovations').deleteMany({user_id: this._id});
    // delete all Discussions that have this user
    await this.model('Discussions').deleteMany({user_id: this._id});
    // delete whitelist
    await this.model('Whitelists').deleteMany({user_id: this._id});

    next();
  } catch (error) {
    next(error);
  }
});
const UserModel = model('Users', userSchema);

UserModel.createIndexes();
export default UserModel;
