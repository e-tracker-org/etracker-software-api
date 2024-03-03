import express from 'express';
import {processRequestBody} from "zod-express-middleware";
import {receiptSchema} from "./receipt.schema";
import {createReceiptCategoryHandler, generateReceiptHandler, getAllReceiptHandler} from "./receipt.controller";
import {authorize} from "../../middleware/authorize";

const router = express.Router();

router
  .route('/category')
    .get(authorize(), getAllReceiptHandler)
    .post(authorize(), processRequestBody(receiptSchema.body), createReceiptCategoryHandler);
router.post('/generate-receipt', authorize(), generateReceiptHandler)

export default router;
