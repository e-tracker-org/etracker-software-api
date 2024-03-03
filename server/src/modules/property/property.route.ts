import express from 'express';
import schema from './property.schema';
import config from './property.config';
import controller from './property.controller';
import { authorize } from '../../middleware/authorize';
import fileUploader from '../uploads/upload-mw';
import propertyConfig from "./property.config";

const router = express.Router();

router
  .route('/')
  .get(authorize(), controller.findAllProperties)
  .post(authorize(), fileUploader, config, schema.create(), controller.createProperty);

router.get('/status', authorize(), controller.findPropertyByStatus);

router.get('/me', authorize(), controller.findPropertyByUserId);

router
  .route('/:id')
  .get(authorize(), controller.findPropertiesById)
  .patch(authorize(), propertyConfig, schema.update(), controller.updatePropertyById)
  .delete(authorize('ADMIN'), controller.deletePropertyById);

export default router;
