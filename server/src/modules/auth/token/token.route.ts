import {processRequestBody} from "zod-express-middleware";
import {tokenSchema} from "./token.schema";
import express from "express";
import tokenController from "./token.controller";

const router = express.Router();
router.post("/verify-token", processRequestBody(tokenSchema.body), tokenController);


export default router
