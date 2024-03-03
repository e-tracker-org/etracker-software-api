import express from 'express';

import {authorize} from "../../middleware/authorize";
import {
    generateReceiptHandler,
    sendReceiptEmailHandler, uploadReceiptHandler,
} from "../receipt/receipt.controller";
import {createTransactionHandler, findTransanctionHandler, updateTransactionHandler} from "./transaction.controller";



const router = express.Router();
router.route('/:accountType')
    .get(authorize(), findTransanctionHandler)
router
  .route('/create-transaction')
  .post(
      authorize(),
      createTransactionHandler,
      generateReceiptHandler,
      sendReceiptEmailHandler,
      uploadReceiptHandler,
      updateTransactionHandler
  );




export default router;
