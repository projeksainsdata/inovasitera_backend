// create logger with winston
// transport with console and file
// Path: app\src\application\logger.js

// create logger with winston
// transport with console and file
// Path: app\src\application\logger.js
import winston from 'winston'
import config from '../config/config.js'

const logger = winston.createLogger({
  level: config.logs.level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: config.logs.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // new winston.transports.Console() is not used in production
    // because it will show the logs in the console
    // which is not needed in production

    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    })
  ]
})

export default logger
