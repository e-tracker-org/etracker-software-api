import express from 'express';
import {
  addTenantToProperty,
  addTenantToPropertyHandler,
  confirmTenantPropertyHandler,
  endTenantAgreementHandler,
  findLandlordTenantHandler,
  inviteTenantHandler,
  notifyTenantHandler,
  searchLandlordTenantHandler,
  searchTenantHandler,
} from './landlord.controller';
import requireUser from '../../middleware/requireUser';
import { authorize } from '../../middleware/authorize';

const router = express.Router();

router.route('/tenant').get(requireUser, findLandlordTenantHandler);
router.get('/tenant/search', requireUser, searchLandlordTenantHandler);
router.get('/search/tenant', requireUser, searchTenantHandler);
router.post('/addProperty', requireUser, addTenantToPropertyHandler);
router.post('/invite/tenant', requireUser, inviteTenantHandler);
router.patch('/confirmTenant', requireUser, confirmTenantPropertyHandler);
router.patch('/end-tenant-agreement', requireUser, endTenantAgreementHandler);
router.post('/notify/tenant', requireUser, notifyTenantHandler);

export default router;
