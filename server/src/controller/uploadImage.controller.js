const cloudinary = require('cloudinary').v2;
const { CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET } = require('../constants');
const uploadDir = require('../modules/uploads/upload-dir');

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
});

async function uploadImage(req, res, next) {
  try {
    const { authorization } = req.headers;

    // Check if authorization header exists
    if (!authorization) {
      return res.status(401).send({ message: 'Unauthorized request' });
    }

    // Check if the request body contains necessary data
    if (!req.body || !req.body.imageFileName) {
      return res.status(400).send({ message: 'Invalid data provided for image upload.' });
    }

    // Get the image file name from the request body
    const { imageFileName } = req.body;

    // Upload image to Cloudinary
    const { secure_url: url, asset_id: id } = await cloudinary.uploader.upload(`${uploadDir}/${imageFileName}`, {
      secure: true,
    });

    // Send the uploaded image URL and asset ID in the response
    res.locals.uploadedImage = { url, id };

    // Call the next middleware
    next();
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
}

module.exports = { uploadImage };
