import { AccountType, AccountTypeModel } from './account-type.model';

export async function createAccountType(accountType: Omit<AccountType, any>) {
  return await AccountTypeModel.create(accountType);
}

export async function findAllAccountTypes() {
  return AccountTypeModel.find();
}

export async function findByAccountType(accountType: string) {
  return AccountTypeModel.find({ accountType });
}

export async function findAccountTypeById(id: string) {
  return AccountTypeModel.findById(id);
}
