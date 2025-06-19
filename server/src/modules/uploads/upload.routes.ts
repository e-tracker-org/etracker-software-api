import express from 'express';
import {
    docsPurgeHandler,
    getAllFilesHandler,
    finishUploadHandler,
    getUserFilesByCategoryAndType,
    deleteFileHandler,
    getFilesUsingUserId
} from './upload.controller';
import uploadHelper from './upload-mw';
import requireUser from "../../middleware/requireUser";
import {getFilesByUserIdAndDocTypeId} from "./upload.services";

const router = express.Router();
router.route('/')
    .post(uploadHelper, finishUploadHandler)
    .get(getAllFilesHandler)
    .delete(deleteFileHandler);
// router.route('/').post(uploadHelper, finishUploadHandler).get(getAllFilesHandler).delete(docsPurgeHandler);
router.route('/userFiles/:category/:type')
    .get(requireUser, getUserFilesByCategoryAndType);

    // get user all files using user id
router.route('/allUserFiles/:userId')
    .get(getFilesUsingUserId);

export default router;
