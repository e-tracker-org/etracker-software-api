import { NextFunction, Request, Response } from 'express';
import { apiError, apiResponse } from '../../utils/response';
import { UpdateProfileBody } from './profile.schema';
import { isValid } from '../../utils/database';
import { findById, findAll, findByEmail, deleteById } from './profile.service';
import { StatusCodes } from 'http-status-codes';

import { findAccountTypeById } from '../account-type/account-type.service';

export async function findAllUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const propertyList = await findAll();
    return apiResponse(res, 'User profile list fetched successfully', propertyList);
  } catch (err) {
    next(err);
  }
}

export async function findUserByIdHandler(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    const profile = await getUser(id);
    return apiResponse(res, 'Profile fetched by ID successfully', profile, StatusCodes.OK);
  } catch (err) {
    next(err);
  }
}

export async function findUserByEmailHandler(req: Request<{}, {}>, res: Response, next: NextFunction) {
  const { email } = res.locals.user;

  try {
    const profile = await findByEmail(email);

    if (profile) {
      return apiResponse(res, 'Profile fetched successfully', profile, StatusCodes.OK);
    }
    return apiError(res, 'No user profile found', StatusCodes.NOT_FOUND);
  } catch (err) {
    next(err);
  }
}

export async function updateUserHandler(req: Request<{}, {}, UpdateProfileBody>, res: Response, next: NextFunction) {
  const { email, accountType } = req.body;

  try {
    const profile = await findByEmail(email);
    // const account = await findAccountTypeById(accountType);

    // if (!account) throw 'Account type not found';
    if (profile) {
      Object.assign(profile, req.body);
      // profile.accountTypes?.push(account);
      const data = await profile.save();
      return apiResponse(res, 'User profile updated successfully', data, StatusCodes.OK);
    }
    return apiError(res, 'No user profile found', StatusCodes.NOT_FOUND);
  } catch (err) {
    next(err);
  }
}

export async function updateUserKycHandler(req: Request<{}, {}, UpdateProfileBody>, res: Response, next: NextFunction) {
  const { accountType } = req.body;
  // determine if is from kyc route
  const isKyc = res.locals.kyc.isKyc;

  const profile = await findByEmail(res.locals.user.email);

  try {
    if (profile) {
      Object.assign(profile, req.body);

      const data = await profile.save();

      if (!isKyc) {
        return apiResponse(res, 'User profile updated successfully', data, StatusCodes.OK);
      }

      // continue in next kyc handler
      res.locals.user = data;

      return next();
    } else {
      return apiError(res, 'No user profile found', StatusCodes.NOT_FOUND);
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteUserByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await getUser(req.params.id);
    await deleteById(profile.id);

    return apiResponse(res, 'User profile deleted successfully');
  } catch (err) {
    next(err);
  }
}

async function getUser(id: string) {
  if (!isValid(id)) throw 'Invalid User idx';
  const profile = await findById(id);
  if (!profile) throw 'User not found';
  return profile;
}
