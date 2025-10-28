import path from 'path';
import fs from 'fs';

// Determine a writable upload directory. In serverless environments the
// application bundle (e.g. /var/task) may be read-only. Allow overriding via
// SERVERLESS_WRITABLE_DIR. If SERVERLESS is explicitly set to 'true' we use
// the common writable tmp path (/tmp). Otherwise default to project public/docs.

const serverlessTmp = process.env.SERVERLESS_WRITABLE_DIR || (process.env.SERVERLESS === 'true' ? '/tmp' : undefined);

const defaultUploadDir = path.join(process.cwd(), 'public', 'docs');

const uploadDir = serverlessTmp ?? defaultUploadDir;

// Ensure directory exists for non-system tmp paths. For /tmp we can assume
// it already exists on most platforms, but creating it is harmless.
try {
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
} catch (err) {
	// If directory creation fails, log to console. The caller should handle
	// any resulting errors when attempting to write files.
	// Keeping this file side-effect minimal to avoid breaking imports.
	// eslint-disable-next-line no-console
	console.warn(`Could not ensure upload directory exists: ${uploadDir}`, err);
}

export default uploadDir;
