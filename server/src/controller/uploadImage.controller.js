const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET } = require('../constants');

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
});

// Determine a safe, writable upload destination.
// Priority: SERVERLESS_WRITABLE_DIR -> '/tmp' when SERVERLESS=true -> local 'public/docs'
let uploadDest = process.env.SERVERLESS_WRITABLE_DIR || (process.env.SERVERLESS === 'true' ? '/tmp' : path.join(process.cwd(), 'public', 'docs'));

// If the chosen path is not absolute, make it relative to project cwd
if (!path.isAbsolute(uploadDest)) {
  uploadDest = path.join(process.cwd(), uploadDest);
}

// Try to ensure the destination exists. If creation fails (e.g., read-only
// filesystem like /var/task), fall back to '/tmp' which is writable on most
// serverless platforms.
try {
  if (!fs.existsSync(uploadDest)) {
    fs.mkdirSync(uploadDest, { recursive: true });
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn(`Could not create upload directory ${uploadDest}, falling back to /tmp. Error:`, err && err.message);
  uploadDest = '/tmp';
}

// Log the final upload destination for easier debugging in serverless logs
// eslint-disable-next-line no-console
console.log('Configured upload destination for Multer:', uploadDest);

// Configure Multer for handling file uploads using the safe destination
const upload = multer({ dest: uploadDest });

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
