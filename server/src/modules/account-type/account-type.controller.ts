import { NextFunction, Request, Response } from 'express';
import {apiError, apiResponse} from '../../utils/response';
import {findUserByEmail} from "../auth/register/register.service";
import {createAccountType, findAllAccountTypes, findByAccountType} from "./account-type.service";
import {AccountTypeSchema} from "./account-type.schema";
import logger from "../../utils/logger";
import {findByEmail} from "../profile/profile.service";
import {StatusCodes} from "http-status-codes";
import {findByStatus} from "../property/property.service";

export async function createAccountTypeHandler(req: Request<{}, {}, AccountTypeSchema>, res: Response, next: NextFunction) {
  const { email } = res.locals.user;
  try {
    const user = await findUserByEmail(email);
    if (!!user) {
      if((await findByAccountType(req.body.accountType)).length)
        return apiError(res, 'Account type already exist', null)
      const user = await createAccountType(req.body);
      return apiResponse(res, 'Account type created successfully', user, StatusCodes.CREATED);
    }
    throw 'User not found';
  } catch (err) {
    next(err);
  }
}

export async function findAllAccountTypeHandler(req: Request<{}, {}>, res: Response, next: NextFunction) {
  const { email } = res.locals.user;
  try {
    const user = await findByEmail(email);
    if(!user) return 'user not found'
    const accountTypes = await findAllAccountTypes();
    return apiResponse(res, 'Account types fetched successfully', accountTypes, StatusCodes.OK);
  } catch (err) {
    next(err);
  }
}
