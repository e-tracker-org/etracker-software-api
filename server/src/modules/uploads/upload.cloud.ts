import { NextFunction, Request, Response } from 'express';
import { CLOUD_KEY, CLOUD_NAME, CLOUD_SECRET } from '../../constants';
import uploadDir from './upload-dir';

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
});

async function uploadToCloud(req: Request, res: Response, next: NextFunction) {
  try {
    const uploadObj = res.locals.uploadedFiles;

    console.log('uploadToCloud<><><>', uploadObj);

    if (uploadObj.names) {
      for (const item of Object.keys(uploadObj.names)) {
        const urls: string[] = [];
        const ids: string[] = [];
        for (const fileName of uploadObj.names[item]) {
          // Set secure option to true to generate secure (HTTPS) URL
          const { secure_url: url, asset_id: id } = await cloudinary.uploader.upload(`${uploadDir}/${fileName}`, {
            secure: true,
          });
          urls.push(url);
          ids.push(id);
        }

        // uploaded Cloudinary urls and asset_id in res.locals.uploadedFiles
        if (urls) {
          uploadObj.urls[item] = urls;
          uploadObj.ids[item] = ids;
        }
      }

      next();
    }
  } catch (error) {
    next(error);
  }
}

export { uploadToCloud };
