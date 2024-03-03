import { NextFunction, Request, Response } from 'express';
import { updateUserById } from '../../auth/register/register.service';
import { KYC, KycStages, KycStatus } from './../kyc.model';
import { createKyc, findKycById } from './../kyc.service';
import { User } from '../../auth/register/register.model';

// update ongoing kyc with new stage
async function updateKyc(accountType: number, kycStage: number, user: User) {
  if (user && user.currentKyc) {
    const oldKyc = await findKycById(user.currentKyc.kycId);

    if (oldKyc) {
      // just to clear ts errors
      if (!oldKyc.filledStages?.includes(kycStage)) oldKyc.filledStages?.push(kycStage); // add to kyc fillStages

      // final stage, mark complete
      if ((accountType == 1 && kycStage == 2) || (accountType == 2 && kycStage == 3)) {
        oldKyc.status = KycStatus.COMPLETE;
      }

      return await oldKyc.save();
    }
  }
  return null;
}

export async function updateOngoingKyc(res: Response, next: NextFunction) {
  try {
    const { user } = res.locals;
    const { accountType, kycStage } = res.locals.kyc;

    const updatedKyc = await updateKyc(accountType, kycStage, user);

    user.currentKyc.kycStage = kycStage; // update user currentKyc with kycStage
    user.currentKyc.status = updatedKyc?.status;
    user.currentKyc.nextStage = getNextKycStage(updatedKyc as KYC);
    console.log('kycData>>>', updatedKyc as KYC)
    console.log('getNextKycStage>>>', getNextKycStage(updatedKyc as KYC))

    return await updateUserById(user?.id, user);
  } catch (error) {
    next(error);
  }
}

export async function createNewKyc(userId: string, res: Response, next: NextFunction) {
  try {
    const { accountType, kycStage } = res.locals.kyc;
    const newKYC = { accountType, status: KycStatus.INCOMPLETE, filledStages: [1], userId: res.locals.user?.id };

    const kycData = await createKyc(newKYC);

    const newCurrentKyc = {
      $set: {
        currentKyc: {
          accountType,
          kycId: kycData.id,
          kycStage,
          nextStage: getNextKycStage(kycData),
          status: KycStatus.INCOMPLETE,
        },
      },
    };

    return await updateUserById(userId, newCurrentKyc);
  } catch (error) {
    next(error);
  }
}

export function getNextKycStage(kyc: KYC) {
  if (kyc.status == KycStatus.COMPLETE) return KycStages[kyc.accountType].sort().reverse()[0] + 1;
   return KycStages[kyc.accountType].sort()[kyc.filledStages.length];
}

export function processKycSwap(newAccountType: number, oldKyc: KYC) {
  //Destructure old kyc filled out stages
  let { filledStages, accountType } = oldKyc;

  const newStages = KycStages[newAccountType];

  let newFilledStages = [];
// set newFilledStages for new switch account type  (eg tenant [1,2])
  for (const num of newStages) {
    if (filledStages.includes(num)) {
      newFilledStages.push(num);
      newFilledStages.sort();
    }
  }

  oldKyc.filledStages = newFilledStages;
  // const status = KycStatus.INCOMPLETE;
  const status = newFilledStages.length == newStages.length ? KycStatus.COMPLETE : KycStatus.INCOMPLETE;
  oldKyc.accountType = newAccountType;

  return { filledStages: newFilledStages, status, newAccountType };
}
