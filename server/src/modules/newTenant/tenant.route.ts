import express from 'express';
import {
    addTenantToProperty, confirmTenantProperty, findAllTenantHandler
} from './tenant.controller';
import requireUser from '../../middleware/requireUser';
import {authorize} from "../../middleware/authorize";


const router = express.Router();

router
  .route('/')
  .get(authorize(), findAllTenantHandler);
  router.post('/addProperty/:tenantId/:propertyId', requireUser, addTenantToProperty)
  router.post('/confirmProperty/:tenantId/:propertyId', requireUser, confirmTenantProperty);


export default router;
