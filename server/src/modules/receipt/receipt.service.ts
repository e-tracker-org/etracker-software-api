
import {ReceiptModel} from "./receipt.model";
import {ReceiptCategory} from "./receipt.interface";

export async function createReceiptCategory(receiptCategory: ReceiptCategory) {
  return await ReceiptModel.create(receiptCategory);
}

export async function findAllReceipt() {
  return ReceiptModel.find();
}

export async function findReceiptByCategory(name: string) {
  return ReceiptModel.findOne({name: name});
}

export async function findReceiptById(id: string) {
  return ReceiptModel.findById(id);
}

