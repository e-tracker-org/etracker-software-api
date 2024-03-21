const express = require('express');
const router = express.Router();
const ratingController = require('../controller/rating.controller');

// Route to create a rating
router.post('/ratings', ratingController.createRating);

// Route to find the tenant rating
router.get('/ratings/:tenantId', ratingController.getTenantRating);

module.exports = router;
