import path from 'path';
import fs from 'fs';
import logger from './logger';

async function createDirectories() {
  const uploadDirectory = path.join(process.cwd(), 'public/docs');

  await fs.access(uploadDirectory, async (err) => {
    if (err) {
      await fs.mkdir(uploadDirectory, { recursive: true }, (err) => {
        if (err) {
          logger.error(err);
        }
      });
    }
  });
}

export default createDirectories;
