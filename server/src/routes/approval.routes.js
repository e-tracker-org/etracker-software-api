const express = require('express');
const router = express.Router();
const approvalController = require('../controller/approval.controller');

router.get('/verification-requests', approvalController.getAllVerificationRequests);
router.get('/default-tenants', approvalController.getAllDefaultTenants);
router.put('/approve/:type/:id', approvalController.approveRequest);
router.put('/reject/:type/:id', approvalController.rejectRequest);

module.exports = router;