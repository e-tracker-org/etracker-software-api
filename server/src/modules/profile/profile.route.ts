import express from 'express';
import {
  deleteUserByIdHandler,
  findUserByEmailHandler,
  findUserByIdHandler,
  updateUserHandler,
  findAllUserHandler,
} from './profile.controller';
import requireUser from '../../middleware/requireUser';

import { processRequestBody } from 'zod-express-middleware';
import { updateProfileSchema } from './profile.schema';

const router = express.Router();

router.route('/all').get(findAllUserHandler);
router
  .route('/')
  .get(requireUser, findUserByEmailHandler)
  .patch(requireUser, processRequestBody(updateProfileSchema.body), updateUserHandler);

router
  .route('/:id')
  .get(requireUser, findUserByIdHandler)
  .patch(requireUser, processRequestBody(updateProfileSchema.body), updateUserHandler)
  .delete(requireUser, deleteUserByIdHandler);

export default router;
