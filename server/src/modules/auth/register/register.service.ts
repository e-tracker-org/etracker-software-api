import { User, UserModel } from './register.model';
import { RegisterUserBody } from './register.schema';

export async function createUser(userData: RegisterUserBody) {
  const { firstname, lastname, email, phone, password, accountTypes = [] } = userData;
  
  return await UserModel.create({
    firstname,
    lastname,
    email,
    phone,
    password,
    accountTypes,
    isEmailVerified: false
  });
}

export async function updateUserById(id: string, update: object) {
  return await UserModel.findOneAndUpdate({ _id: id }, update, { new: true });
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export async function updateUserByEmail(email: User['email'], password: User['password']) {
  return UserModel.updateOne({ email }, { $set: { password } });
}

export async function updateUserIsVerifiedByEmail(email: User['email']) {
  return UserModel.updateOne({ email }, { $set: { isEmailVerified: true } });
}

export async function updateProfileById(id: string, update: object) {
  delete (update as any).currentKyc;

  const unsetQuery = { $unset: { "currentKyc": {} } };

  return  UserModel.findByIdAndUpdate(id, unsetQuery);
}
