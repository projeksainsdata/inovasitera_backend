import logger from './logger.js';

export default function connection(mongoose, config, options) {
  function connectToMongo() {
    mongoose
      .connect(config.mongo.uri, options)
      .then(
        () => {},
        (err) => {
          logger.error(err);
        },
      )
      .catch((err) => {
        logger.error(err);
      });
  }

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected!');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected!');
  });

  mongoose.connection.on('error', (error) => {
    logger.error(`MongoDB connection error: ${error}`);
    mongoose.disconnect();
  });

  mongoose.connection.on('disconnected', () => {
    logger.error('MongoDB disconnected! Reconnecting... ');
    setTimeout(() => connectToMongo(), 1000);
  });

  return {
    connectToMongo,
  };
}
