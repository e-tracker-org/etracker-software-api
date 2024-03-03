import express from 'express';
import requireUser from '../../middleware/requireUser';
import {createKycHandler, kycHandler, switchOngoingKyc, updateKycStatus} from './kyc.controller';

const router = express.Router();

router.route('/:id').post(requireUser, switchOngoingKyc);
router.route('/:accountType/:stage').post(requireUser, kycHandler, createKycHandler);
router.route('/status/:status/:kycId').post(requireUser, updateKycStatus);

export default router;
