import { User, UserModel } from '../auth/register/register.model';

export async function create(profile: Omit<User, any>) {
  return await UserModel.create(profile);
}

export async function findAll() {
  return await UserModel.find();
}

export async function findById(id: string) {
  return await UserModel.findById(id);
}

export async function findByEmail(email: string) {
  return await UserModel.findOne({ email });
}

export async function findUserById(userId: string) {
  return await UserModel.find({ _id: userId }).toArray();
}

export async function deleteById(id: string) {
  await UserModel.findByIdAndDelete(id);
}
