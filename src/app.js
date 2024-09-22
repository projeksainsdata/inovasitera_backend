import express from 'express';
import expressConfig from './application/express.js';
import config from './config/config.js';
// import routes
import routes from './router/index.js';
import connectionDb from './application/databases.js';
// import server config
import serverConfig from './application/server.js';
import errorHandler from './middlewares/error.middleware.js';
// import http
import http from 'http';
import mongoose from 'mongoose';

// to handle BigInt type data
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// create express app
const app = express();
const server = http.createServer(app);

// connect to mongo db
connectionDb(mongoose, config, {
  autoIndex: true,
  connectTimeoutMS: 1000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
}).connectToMongo();

// setup express configuration
expressConfig(app);

// setup routes
routes(app, express);

// setup error handler
app.use(errorHandler);

const terminus = serverConfig(app, mongoose, server, config);




// if server is not running in test environment then start server
if (config.env !== 'test') {
  terminus.startServer()
}

// export app, server, terminus

export {app, server, terminus};
