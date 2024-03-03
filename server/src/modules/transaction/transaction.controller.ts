
import {NextFunction, Request, Response} from "express";
import {ReceiptBody} from "../receipt/receipt.schema";
import {findUserByEmail} from "../auth/register/register.service";
import {createReceiptCategory, findReceiptByCategory, findReceiptById} from "../receipt/receipt.service";
import {apiResponse} from "../../utils/response";
import {transactionBody} from "./transaction.schema";
import {
    createTransaction,
    findTransaction,
    updateTransaction
} from "./transaction.service";
import {findById} from "../profile/profile.service";
import {genarateUniqueId as generateTransactionId} from "../../utils/generateUniqueId";
import {number} from "zod";

export async function createTransactionHandler(req: Request<{}, {}, transactionBody>, res: Response, next: NextFunction) {
    const { category, dueDate, amount, tenants } = req.body;
    const { email } = res.locals.user;
    try {
        //Confirm logged in user exist
        const user = await findUserByEmail(email);
        if(!user) throw 'User not found';

        //Validate all request parameters
        if(!category) throw 'Transaction category is required';
        if(!dueDate) throw 'Transaction due date is required';
        if(!amount) throw 'Transaction amount is required';
        if(!tenants) throw 'Transaction receipients  required';

        const categoryExist = await findReceiptById(category);
        if(!categoryExist) throw 'Receipt category does not exist';

        const transactionInfo: any = req.body;
        transactionInfo.created_by = user.id;
        const recipients = []

        for (const tenantId of tenants) { // array of tenant's or users id
            //create each transaction for each tenant
            delete transactionInfo.tenants
            transactionInfo.received_by = tenantId;
            transactionInfo.status = 'PAID'
            const receipt = await createTransaction(transactionInfo);
            //set up receipients email to send receipt to
            const tenantInfo = await findById(tenantId);
            recipients.push({id: tenantInfo.id, email: tenantInfo.email});

        }
        transactionInfo.description = categoryExist.description
        transactionInfo.category = categoryExist.name
        transactionInfo.recipients = recipients
        res.locals.transactionInfo = transactionInfo;
        next();
    } catch (err) {
        next(err)
    }
}



export async function updateTransactionHandler(req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
   const {receiptURL, recipients } =  res.locals.updateTransactionInfo


    for (const recipient of recipients) {
        const transactionId = generateTransactionId();
        await updateTransaction(recipient.id,  {transactionId, receiptFile: receiptURL});
    }
    return apiResponse(res, 'Transaction created and receipt email sent successfully', '', 201);
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
        if (!user.accountTypes.includes(accountType)) throw `User is not a ${+accountType === 1 ? 'tenant' : 'landlord'}`;
        const transactions = await findTransaction(user.id, accountType);

        return apiResponse(res, `Tenants successfully fetched`, transactions, 201);
    } catch (err) {
        next(err);
    }
}

