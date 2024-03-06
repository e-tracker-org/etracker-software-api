import { User, UserModel } from '../auth/register/register.model';

export async function findAllUser() {
  return await UserModel.find();
}
