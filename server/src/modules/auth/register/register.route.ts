import express from "express";
import { processRequestBody } from "zod-express-middleware";

import { registerUserHandler } from "./register.controller";
import { registerUserSchema } from "./register.schema";

const router = express.Router();

router.post("/", processRequestBody(registerUserSchema.body), registerUserHandler);

export default router;
