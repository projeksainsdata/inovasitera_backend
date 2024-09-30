import morgan from 'morgan';
import compression from 'compression';
import express from 'express';
import logger from './logger.js';
import cors from 'cors';
import helmet from 'helmet';
import {RateLimiterMemory} from 'rate-limiter-flexible';
import cookieParser from 'cookie-parser';

import config from '../config/config.js';
import ENVIROMENT from '../enum/environment.enum.js';
export default function expressConfig(app) {
  // setup express configuration here
  app.use(
    compression({
      level: 6,
      threshold: 100 * 1000,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return config.env === ENVIROMENT.PRODUCTION;
        }
        return compression.filter(req, res);
      },
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({extended: true, limit: '10mb'}));
  // setup session

  // cors
  app.use(cors());

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });
  // helmet
  app.use(helmet({}));
  // rate limiter
  const rateLimiter = new RateLimiterMemory({
    points: 20,
    duration: 1,
  });

  app.use('/uploads', express.static(config.storage.dir));
  app.use((req, res, next) => {
    rateLimiter
      .consume(req.ip)
      .then(() => {
        next();
      })
      .catch(() => {
        res.status(429).send('Too Many Requests');
      });
  });

  app.use(
    morgan(
      (tokens, req, res) => {
        return `${tokens['response-time'](req, res)}ms - ${tokens.date(
          req,
          res,
          'iso',
        )} ${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(
          req,
          res,
        )} ${tokens.res(req, res, 'content-length')} `;
      },
      {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      },
    ),
  );
}
