# Build a property data management system with Express, MongoDB, & TypeScript

## Features

1. Register user
2. Login
3. Get current logged in user (me)

## Technologies

### Backend

- [Express](https://expressjs.com/)
- [Mongoose](https://www.mongodb.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [argon2](https://www.npmjs.com/package/argon2)
- [busboy](https://www.npmjs.com/package/busboy)
- [pino](https://github.com/pinojs/pino)
- [Zod](https://github.com/colinhacks/zod)

1. Demonstration
2. Code walk-through
3. Bootstrap server
   - Initialise application
   - Setup express
   - Setup logger
   - Setup Mongoose
4. User

   - Register user
   - Login
   - Require user and deserialize user middleware
   - Get current user

5. Setup client
6. Auth
   - Login screen
   - Register screen
7. File Upload
   - Upload files (uploads to server's local stoarage, then cloud, then saves to db). The upload object is stored in `res.locals.uploadedFiles.fileItems`. fileItem id should be the one stored in parent object for the upload.
   - Use `uploadHelper` mw from `upload-mw.ts` for all file uploads
   - To get file item - returns fileItem from db, including its urls. use `getFileById(id)` from `upload.services`
   - For upload directory, import uploadDir from `upload-dir` in upload module.
