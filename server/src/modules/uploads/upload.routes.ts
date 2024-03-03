import express from 'express';
import {
    docsPurgeHandler,
    getAllFilesHandler,
    finishUploadHandler,
    getUserFilesByCategoryAndType,
    deleteFileHandler
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

export default router;
