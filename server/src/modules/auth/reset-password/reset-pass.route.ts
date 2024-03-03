import express from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { resetPassHandler } from './reset-pass.controller';
import { resetPassBody } from './reset-pass.schema';

const router = express.Router();

router.post('/', processRequestBody(resetPassBody.body), resetPassHandler);

export default router;
