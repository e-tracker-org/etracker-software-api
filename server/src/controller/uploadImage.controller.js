const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET } = require('../constants');

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
});

// Configure Multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

async function uploadImage(req, res, next) {
  console.log(req, 'request');
  try {
    const { authorization } = req.headers;

    // Check if authorization header exists
    if (!authorization) {
      return res.status(401).send({ message: 'Unauthorized request' });
    }

    // Check if a file is provided
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded.' });
    }

    // Upload image to Cloudinary
    const { secure_url: url, asset_id: id } = await cloudinary.uploader.upload(req.file.path, {
      secure: true,
    });

    // Send the uploaded image URL and asset ID in the response
    res.status(200).send({ url, id });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadImage: [upload.single('doc1_files'), uploadImage],
};
