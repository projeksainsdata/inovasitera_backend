import {createTerminus} from '@godaddy/terminus';
import logger from './logger.js';

export default function serverConfig(app, mongoose, serverInit, config) {
  // create terminus
  function healthCheck() {
    // check is db error or not
    return mongoose.connection.db
      .admin()
      .ping()
      .then(() => {
        return Promise.resolve();
      })
      .catch((err) => {
        logger.error(err);
        return Promise.reject(err);
      });
  }

  function onSignal() {
    // onSignal function is called when server is going to shutdown or restart or reload or stop database connection

    logger.info('server is starting cleanup');
    // disconnect from database
    return mongoose.disconnect().then(() => {
      logger.info('cleanup finished, server is shutting down');
      return Promise.resolve();
    });
  }

  function beforeShutdown() {
    // beforeShutdown function is called before server is going to shutdown or restart or reload or stop

    logger.info('server is starting cleanup');

    // disconnect from database
    return mongoose.disconnect().then(() => {
      logger.info('cleanup finished, server is shutting down');
      return Promise.resolve();
    });
  }

  function onShutdown() {
    // onShutdown function is called when server is going to shutdown or restart or reload or stop
    logger.info('cleanup finished, server is shutting down');
  }

  function startServer() {
    // start server

    // create terminus
    createTerminus(serverInit, {
      signal: 'SIGINT',
      logger: logger.info,
      healthChecks: {
        '/healthcheck': healthCheck,
      },
      onSignal,
      beforeShutdown,
      onShutdown,
    }).listen(config.port, () => {
      logger.info(
        `Express server listening on http://127.0.0.1:${config.port}/, in %s mode`,
        config.port,
        app.get('env'),
      );
    });
  }

  return {
    startServer,
  };
}
