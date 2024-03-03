import express from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { verifyAccountHandler } from './verify-account.controller';
import { verifyAccountSchema } from './verify-account.schema';

const router = express.Router();

router
    .route('/')
    .post(processRequestBody(verifyAccountSchema.body), verifyAccountHandler);

export default router;
