import { NextFunction, Request, Response } from 'express';
import { ReceiptBody } from '../receipt/receipt.schema';
import { findUserByEmail } from '../auth/register/register.service';
import { createReceiptCategory, findReceiptByCategory, findReceiptById, updateReceiptHistoryStatus } from '../receipt/receipt.service';
import { apiResponse } from '../../utils/response';
import { transactionBody } from './transaction.schema';
import { createTransaction, findTransaction, updateTransaction } from './transaction.service';
import { findById } from '../profile/profile.service';
import { genarateUniqueId as generateTransactionId } from '../../utils/generateUniqueId';
import { StatusCodes } from 'http-status-codes';

export async function createTransactionHandler(
  req: Request<{}, {}, transactionBody>,
  res: Response,
  next: NextFunction
) {
  const { category, dueDate, amount, tenants } = req.body;
  const { email } = res.locals.user;
  try {
    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if (!user) throw 'User not found';

    //Validate all request parameters
    if (!category || category.trim() === '') throw 'Transaction category is required';
    if (!dueDate) throw 'Transaction due date is required';
    if (!amount || amount <= 0) throw 'Valid transaction amount is required';
    if (!tenants || !Array.isArray(tenants) || tenants.length === 0) throw 'Transaction recipients are required';

    const categoryDescriptions: Record<string, string> = {
      rent: 'Monthly rent payment',
      'light bill': 'Electricity bill payment',
      'water bill': 'Water bill payment',
      'cleaner bill': 'Payment for cleaning services',
      'waste bill': 'Payment for waste management services',
      'security bill': 'Payment for security services',
      'service charge': 'Additional charges for various services provided by the landlord or property management',
    };

    const lowercaseCategory = category.toLowerCase();
    const predefinedCategories = Object.keys(categoryDescriptions).map((cat) => cat.toLowerCase());

    if (!predefinedCategories.includes(lowercaseCategory)) {
      throw 'Invalid transaction category';
    }

    const transactionInfo: any = req.body;
    transactionInfo.created_by = user.id;
    const recipients = [];
    const transactionIds: string[] = [];

    const processedIds = new Set(); // Set to store processed IDs

    for (const tenantId of tenants) {
      // Check if the ID has already been processed
      if (processedIds.has(tenantId)) {
        continue; // Skip if the ID has already been processed
      }

      // Add the ID to the set of processed IDs
      processedIds.add(tenantId);

      // array of tenant's or users id
      // create each transaction for each tenant
      delete transactionInfo.tenants;
      transactionInfo.received_by = tenantId;
      transactionInfo.status = 'PAID';
      const receipt = await createTransaction(transactionInfo);

      // set up recipients' email to send receipt to
      const tenantInfo = await findById(tenantId);
      const transactionId = generateTransactionId();
      recipients.push({ id: tenantInfo.id, email: tenantInfo.email, transactionId });
      transactionIds.push(transactionId);
    }
    
    transactionInfo.description = categoryDescriptions[lowercaseCategory];
    transactionInfo.category = category;
    transactionInfo.recipients = recipients;
    transactionInfo.transactionIds = transactionIds;
    res.locals.transactionInfo = transactionInfo;
    next();
  } catch (err) {
    next(err);
  }
}

export async function updateTransactionHandler(req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  const { receiptURL, recipients } = res.locals.updateTransactionInfo;

  try {
    for (const recipient of recipients) {
      const transactionId = generateTransactionId();
      await updateTransaction(recipient.id, { transactionId, receiptFile: receiptURL });
      
      // Update receipt history with transaction ID
      try {
        await updateReceiptHistoryStatus(transactionId, 'DELIVERED');
      } catch (error) {
        console.error('Error updating receipt history:', error);
      }
    }
    return apiResponse(res, 'Transaction created and receipt email sent successfully', { receiptURL }, 201);
  } catch (error) {
    console.error('Error updating transaction:', error);
    next(error);
  }
}

export async function findTransanctionHandler(req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  const { email } = res.locals.user;
  const { accountType } = req.params;

  if (!accountType) throw 'Account type required';

  try {
    //Confirm logged in user exist
    const user = await findUserByEmail(email);
    if (!user) throw 'User not found';

    // confirm the user is either a tenant or landlord
    if (!user.accountTypes || !user.accountTypes.includes(Number(accountType))) {
      throw `User is not a ${Number(accountType) === 1 ? 'tenant' : 'landlord'}`;
    }
    
    const transactions = await findTransaction(user.id, accountType);

    return apiResponse(res, `Transactions fetched successfully`, transactions, 200);
  } catch (err) {
    next(err);
  }
}
