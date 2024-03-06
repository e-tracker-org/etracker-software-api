import { KYC, KYCModel } from './kyc.model';
import { UserModel } from '../auth/register/register.model';

export async function createKyc(kyc: Omit<KYC, any>) {
  return await KYCModel.create(kyc);
}

export async function findAllKycs() {
  return KYCModel.find();
}

export async function findKycById(id: string) {
  return KYCModel.findById(id);
}

export async function findKycByEmail(email: string) {
  return await KYCModel.findOne({ email });
}

export async function findKycsByStatus(status: KycStatus) {
  return KYCModel.find({ status });
}
