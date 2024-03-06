import { NextFunction, Request, Response } from 'express';
import { apiError, apiResponse } from '../../utils/response';
import updateProfileStage from './stages/updateProfileStage.kyc';
import identityDocumentStage from './stages/identityDocumentStage.kyc';
import addPropertyStage from './stages/addPropertyStage.kyc';
import { createNewKyc, getNextKycStage, processKycSwap, updateOngoingKyc } from './helper/helpers.kyc';
import { StatusCodes } from 'http-status-codes';
import { findKycByEmail, findKycById, findKycsByStatus, findAllKycs } from './kyc.service';
import { updateProfileById, updateUserById } from '../auth/register/register.service';
import { findByEmail, findById } from '../profile/profile.service';
import { KycStatus } from './kyc.model';

async function checkParams(req: Request, res: Response, next: NextFunction) {
  const { accountType, stage } = req.params;
  try {
    if (res.locals.user.currentKyc && accountType != res.locals.user.currentKyc.accountType)
      throw 'Non matching account type';

    if (
      accountType.trim() == '' ||
      accountType == 'undefined' ||
      stage.toLocaleLowerCase() == 'undefined' ||
      Number(accountType) > 3 ||
      Number(stage) > 3
    )
      throw 'Undefined params or wrong params set';
  } catch (err) {
    return next(err);
  }
}

export async function kycHandler(req: Request, res: Response, next: NextFunction) {
  const kycStage = Number(req.params.stage);
  const accountType = Number(req.params.accountType);
  res.locals.kyc = { isKyc: true, kycStage, accountType };

  await checkParams(req, res, next);

  if (kycStage) {
    switch (kycStage) {
      case 1: // profile
        await updateProfileStage(req, res, next);
        break;
      case 2: // documents
        await identityDocumentStage(req, res, next);
        break;
      case 3: // property
        await addPropertyStage(req, res, next);
        break;
      default:
        break;
    }
  } else {
    throw 'Invalid KYC request';
  }
}

export async function createKycHandler(req: Request, res: Response, next: NextFunction) {
  const { user } = res.locals;

  if (res.locals.kyc.kycStage == 1 || !user?.currentKyc) {
    // is a new kyc
    apiResponse(res, 'Success', await createNewKyc(user.id, res, next));
  } else {
    // not new kyc, it is a continuation
    apiResponse(res, 'Success', await updateOngoingKyc(res, next));
  }
}

export async function switchOngoingKyc(req: Request, res: Response, next: NextFunction) {
  const { user } = res.locals;

  const { currentKyc } = user;
  const newAccountType = Number(req.params.id);

  if (!currentKyc) {
    return apiResponse(res, 'No ongoing kyc', null, StatusCodes.NOT_MODIFIED);
  }

  const oldKyc = await findKycById(currentKyc.kycId);

  if (oldKyc) {
    const updatedycFields = processKycSwap(newAccountType, oldKyc);
    Object.assign(oldKyc, updatedycFields);

    const updatedKyc = await oldKyc.save();

    // const nextStage = getNextKycStage(updatedKyc);
    const nextStage = [...updatedKyc.filledStages].reverse()[0] + 1;

    user.currentKyc = {
      ...currentKyc,
      nextStage,
      kycStage: [...updatedKyc.filledStages].reverse()[0],
      accountType: updatedKyc.accountType,
      status: updatedKyc.status,
    };

    const updatedUser = await updateUserById(user.id, user);

    return apiResponse(res, 'Success', updatedUser);
  }
}

export async function updateKycStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { kycId, status } = req.params;

    if (!kycId) {
      return apiResponse(res, 'Kyc Id is required', null, StatusCodes.NOT_FOUND);
    }
    if (!status) {
      return apiResponse(res, 'Kyc status is required', null, StatusCodes.BAD_REQUEST);
    }

    const kycDetails = await findKycById(kycId);

    if (!kycDetails) {
      return apiResponse(res, 'Kyc details not found', null, StatusCodes.NOT_FOUND);
    }
    if (kycDetails.status === KycStatus.COMPLETE) {
      if (status !== 'approve' && status !== 'reject') {
        return apiResponse(res, 'Invalid Kyc status', null, StatusCodes.BAD_REQUEST);
      }

      const updateProfile = await findById(kycDetails.userId);
      //Handle kyc approve status
      if (status === 'approve') {
        handleKycApprove(kycDetails, updateProfile);
      }

      //Handle kyc reject status
      if (status === 'reject') {
        handleKycReject(kycDetails, updateProfile);
      }

      // Handle successful update and return response
      return apiResponse(res, 'Kyc status updated successfully', null, StatusCodes.OK);
    } else {
      throw 'Kyc not completed';
    }
  } catch (error) {
    // Handle error and display error message or perform appropriate actions
    console.error('Error occurred while managing KYC approval/rejection', error);
    next(error);
  }
}

const handleKycApprove = async (kycDetails, updateProfile) => {
  kycDetails.status = KycStatus.APRROVED;

  // Create an array of account type references
  const accountTypeRef = [kycDetails.accountType];

  // delete currentKyc object from the database
  const profileDetails = await updateProfileById(updateProfile._id, updateProfile);
  profileDetails.accountTypes = accountTypeRef;
  await Promise.all([
    kycDetails.save(), // Save the modified kycDetails
    profileDetails.save(), // Update the profile object in the database
  ]);
};

const handleKycReject = async (kycDetails, updateProfile) => {
  kycDetails.status = KycStatus.INCOMPLETE;

  // Confirm if accounttype already exist and approved
  const accountExist = updateProfile.accountTypes.includes(kycDetails.accountType);

  // Remove account type from approved accounts on profile if exist
  if (accountExist) {
    const newAccountTypes = updateProfile.accountTypes.filter((accountType) => accountType !== kycDetails.accountType);
    updateProfile.accountTypes = newAccountTypes;
  }
  //Reset currentKyc back to previous
  updateProfile.currentKyc = {
    kycStage: [...kycDetails.filledStages].reverse()[0],
    nextStage: +kycDetails.filledStages[kycDetails.filledStages.length - 1],
    accountType: kycDetails.accountType,
    status: KycStatus.INCOMPLETE,
    kycId: kycDetails._id,
  };

  await Promise.all([
    kycDetails.save(), // Save the modified kycDetails
    updateUserById(updateProfile._id, updateProfile), // Update the profile object in the database
  ]);
};

export async function getKycsForApproval(req: Request, res: Response, next: NextFunction) {
  try {
    const kycsForApproval = await findKycsByStatus(KycStatus.COMPLETE);
    apiResponse(res, 'Success', kycsForApproval);
  } catch (error) {
    console.error('Error retrieving KYC for approval', error);
    next(error);
  }
}

export async function getAllKycs(req: Request, res: Response, next: NextFunction) {
  try {
    const allKycs = await findAllKycs();
    res.json(allKycs);
  } catch (error) {
    console.error('Error fetching all KYCs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
