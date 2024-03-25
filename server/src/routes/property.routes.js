const express = require('express')
const router = express.Router()
const propertyController = require('../controller/property.controller');

router.get('/', propertyController.findAll);

module.exports = router