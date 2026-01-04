
import {ReceiptModel, ReceiptHistoryModel, IReceiptHistory} from "./receipt.model";
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

export async function createReceiptHistory(receiptData: IReceiptHistory) {
  try {
    return await ReceiptHistoryModel.create(receiptData);
  } catch (error) {
    console.error('Error creating receipt history:', error);
    throw error;
  }
}

export async function findReceiptHistory(transactionId: string) {
  try {
    return await ReceiptHistoryModel.findOne({ transactionId });
  } catch (error) {
    console.error('Error finding receipt history:', error);
    throw error;
  }
}

export async function findReceiptHistoryByRecipient(recipientId: string) {
  try {
    return await ReceiptHistoryModel.find({ recipientId }).sort({ sentAt: -1 });
  } catch (error) {
    console.error('Error finding receipt history by recipient:', error);
    throw error;
  }
}

export async function updateReceiptHistoryStatus(transactionId: string, status: 'SENT' | 'DELIVERED' | 'FAILED') {
  try {
    return await ReceiptHistoryModel.updateOne(
      { transactionId },
      { status, updatedAt: new Date() }
    );
  } catch (error) {
    console.error('Error updating receipt history status:', error);
    throw error;
  }
}

