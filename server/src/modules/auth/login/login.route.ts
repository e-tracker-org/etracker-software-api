import express, { Request, Response } from 'express';
import { processRequestBody } from 'zod-express-middleware';
import {loginHandler, loginFailureHandler, logoutHandler} from './login.controller';
import { loginSchema } from './login.schema';

const router = express.Router();

router.post('/login', processRequestBody(loginSchema.body), loginHandler);
router.post('/logout', logoutHandler);

export default router;
