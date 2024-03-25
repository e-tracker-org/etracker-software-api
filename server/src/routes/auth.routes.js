const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller.js');

router.post('/update-account-type/:id', userController.updateUserAccountType);
router.get('/', userController.findAllUsers);

module.exports = router;
