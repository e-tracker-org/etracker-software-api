const express = require('express');
const router = express.Router();
const paystackController = require('../controller/paystack.controller');

router.use('/', paystackController);


module.exports = router;