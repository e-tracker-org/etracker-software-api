import {TransactionModel} from "./transaction.model";
import {PropertyModel} from "../property/property.model";


export async function createTransaction(transaction : TransactionModel) {
  return await TransactionModel.create(transaction);
}

export async function updateTransaction(recipientId: string, receiptInfo) {
  return await TransactionModel.updateOne({received_by: recipientId}, {$set: receiptInfo});
}

export async function findTransaction(userId: string, accountType: string) {
    if(accountType == 1) {
        return TransactionModel.find({ received_by: userId });
    }
    if(accountType == 2) {
        return TransactionModel.find({ created_by: userId });
    }
}




