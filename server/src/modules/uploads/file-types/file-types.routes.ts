import express from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { createFileTypeSchema } from './file-types.schema';
import {
    createFileType,
    getFilesByCategory,
    getFilesByType,
    getFilesByTypeAndCategory,
    getFileTypes
} from './file-types.controller';
import {authorize} from "../../../middleware/authorize";
import {getAllFileTypes} from "./file-types.service";

const router = express.Router();

router.route('/').post(processRequestBody(createFileTypeSchema.body), createFileType).get(getFileTypes);
router.get('/type/:type/:accountType', authorize(),  getFilesByType);
router.get('/category/:category/:accountType', authorize(),  getFilesByCategory);
router.get('/type/:type/category/:category/:accountType', authorize(),  getFilesByTypeAndCategory);

export default router;
