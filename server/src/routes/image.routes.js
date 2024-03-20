const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controller/uploadImage.controller');

// Define the route for uploading an image
router.post('/upload-image', uploadImage);

module.exports = router;
