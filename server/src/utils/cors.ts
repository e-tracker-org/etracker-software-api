import { CORS_ORIGIN } from '../constants';

const whiteList = CORS_ORIGIN.split(',');

export const corsOptions = {
  // @ts-ignore
  origin: function (origin: CustomOrigin, callback: NoParamCallback) {
    if (!origin) return callback(null, true);
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
};
