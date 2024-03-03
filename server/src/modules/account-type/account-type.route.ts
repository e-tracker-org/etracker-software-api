import express from "express";
import { processRequestBody } from "zod-express-middleware";
import {accountTypeSchema,} from "./account-type.schema";
import {createAccountTypeHandler, findAllAccountTypeHandler} from "./account-type.controller";
import requireUser from "../../middleware/requireUser";

const router = express.Router();

router.route('/')
    .get( requireUser, findAllAccountTypeHandler)
    .post(processRequestBody(accountTypeSchema.body), requireUser, createAccountTypeHandler)

export default router;
