import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ErrorHandler, NotFoundHandler } from './middleware/globalExceptionHandler';
import { corsOptions } from './utils/cors';
import { connectToDatabase, disconnectFromDatabase } from './utils/database';
import logger from './utils/logger';
import { CORS_ORIGIN, DB_CONNECTION_STRING, EXPRESS_SESSION_SECRET, PORT } from './constants';
import deserializeUser from './middleware/deserializeUser';
import routerV1 from './utils/route-v1.index';
import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
// import passport from "./modules/auth/google/strategy";
import passport from 'passport';
import createDirectories from './utils/directories';
const MongoStore = require('connect-mongo');

// Initialize client.
// let redisClient = createClient();
// redisClient.connect().catch(console.error);

// // Initialize store.
// let redisStore = new RedisStore({
//   client: redisClient,
//   prefix: 'myapp:',
// });

// Initialize client.
let redisClient = createClient();

redisClient.on('error', (err) => {
  console.error(`Redis client error: ${err}`);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'myapp:',
});

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

app.use(
  session({
    secret: EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: redisStore,
  })
);

app.use(passport.initialize());
app.use(passport.session());

require('./modules/auth/google/strategy/strategy-setup');
// app.use(cors(corsOptions));

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  })
);
app.use(helmet());
app.use(deserializeUser);

app.use('/api/v1/', routerV1);

app.use(NotFoundHandler);

app.use(ErrorHandler);

const server = app.listen(PORT, async () => {
  await createDirectories();
  await connectToDatabase();
  logger.info(`Server up and running on http://localhost:${PORT}`);
});

const signals = ['SIGTERM', 'SIGINT'];

function gracefulShutdown(signal: string) {
  /*process.on is a method in Node.js that allows you to register event listeners for
  various signals or events that occur during the lifetime of a Node.js process.*/
  process.on(signal, async () => {
    logger.info('Goodbye, got signal', signal);
    server.close();

    // disconnect from the db
    await disconnectFromDatabase();

    logger.info('My work here is done');

    process.exit(0);
  });
}

for (let i = 0; i < signals.length; i++) {
  gracefulShutdown(signals[i]);
}
