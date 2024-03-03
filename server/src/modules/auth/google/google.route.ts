import express, { Response } from 'express';
import passport from 'passport';
import { signJwt } from '../login/login.utils';
import { apiResponse } from '../../../utils/response';
import { loginFailureHandler, loginHandler } from '../login/login.controller';
import { googleLoginHandler } from './googleLoginHandler';

const router = express.Router();

router.get(
  '/',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);
router.get(
  '/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/v1/auth/google/login/failed',
  }),
  googleLoginHandler
);

router.get('/login/failed', loginFailureHandler);

export default router;
