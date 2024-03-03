import express, { Request, Response } from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { otpSchema } from './otp.schema';
import { verifyOtpHandler } from './otp.controller';

const router = express.Router();

router.post('/', processRequestBody(otpSchema.body), verifyOtpHandler);

export default router;
