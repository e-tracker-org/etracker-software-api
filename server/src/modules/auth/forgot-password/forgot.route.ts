import express from 'express';
import { processRequestBody } from 'zod-express-middleware';

import { forgotPassHandler } from './forgot.controller';
import { forgotPassSchema } from './forgot.schema';

const router = express.Router();

router.post('/', processRequestBody(forgotPassSchema.body), forgotPassHandler);

export default router;
