import dotenv from 'dotenv'
dotenv.config()

export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  api: {
    prefix: '/api'
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiration: process.env.JWT_EXPIRATION || '1d',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID || 'client_id',
    client_secret: process.env.GOOGLE_SECRET || 'client_secret',
    redirect_uris:
      process.env.GOOGLE_REDIRECT_URI ||
      `http://localhost:${process.env.PORT}/auth/google/callback`
  },
  frontend: {
    url: process.env.FRONTEND_URL || '*',
    port: process.env.FRONTEND_PORT || 5000,
    homePage: process.env.FRONTEND_HOME_PAGE || 'http://localhost:5000',
    domain: process.env.FRONTEND_DOMAIN || 'localhost'
  }
}
