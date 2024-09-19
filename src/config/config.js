import dotenv from 'dotenv'
dotenv.config()

export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  logs: {
    level: process.env.LOG_LEVEL || "silly",
    file: process.env.LOG_FILE || "logs/app.log",

    // logs/combined.log
    combined: {
      filename: process.env.LOG_COMBINED || "logs/combined.log",
      maxsize: Number(process.env.LOG_MAX_SIZE) || 10485760,
      maxFiles: Number(process.env.LOG_COMBINED_FILES) || 5,
    },

    // logs/error.log
    error: {
      filename: process.env.LOG_ERROR || "logs/error.log",
      maxsize: process.env.LOG_ERROR_MAX_SIZE || 10485760,
      maxFiles: process.env.LOG_ERROR_FILES || 5,
    },

    // logs/exceptions.log
    exceptions: {
      filename: process.env.LOG_EXCEPTIONS || "logs/exceptions.log",
      maxsize: process.env.LOG_EXCEPTIONS_MAX_SIZE || 10485760,
      maxFiles: process.env.LOG_EXCEPTIONS_FILES || 5,
    },

    // logs/requests.log
    requests: {
      filename: process.env.LOG_REQUESTS || "logs/requests.log",
      maxsize: process.env.LOG_REQUESTS_MAX_SIZE || 10485760,
      maxFiles: process.env.LOG_REQUESTS_FILES || 5,
    },
  },
  api: {
    prefix: '/api'
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/inovasi-itera-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  },
  email: {
    user: process.env.EMAIL_USER || "test@gmail.com",
    pass: process.env.EMAIL_PASS || "123456",
    verifyUrl: process.env.VERIFY_URL || "http://localhost:5173/confirm-email",
    reseturl: process.env.RESET_URL || "http://localhost:5173/reset-password",
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
