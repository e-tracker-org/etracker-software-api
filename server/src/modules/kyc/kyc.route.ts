import express from 'express';
import requireUser from '../../middleware/requireUser';
import {
  createKycHandler,
  kycHandler,
  switchOngoingKyc,
  updateKycStatus,
  getKycsForApproval,
  getAllKycs,
  getUserKYCbyId,
} from './kyc.controller';

const router = express.Router();

router.route('/for-approval').get(getKycsForApproval);
router.get('/all', getAllKycs);
router.route('/:id').post(requireUser, switchOngoingKyc);
router.route('/user/:id').get(getUserKYCbyId);
router.route('/:accountType/:stage').post(requireUser, kycHandler, createKycHandler);
router.route('/status/:status/:kycId').post(updateKycStatus); // i removed requireUser so i will be able to make use of the route

export default router;
