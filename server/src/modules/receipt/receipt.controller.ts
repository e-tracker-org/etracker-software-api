import {NextFunction, Request, Response} from "express";
import {findUserByEmail} from "../auth/register/register.service";
import {createReceiptCategory, findAllReceipt, findReceiptByCategory} from "./receipt.service";
import {apiResponse} from "../../utils/response";
import {ReceiptBody} from "./receipt.schema";
import PDFDocument from "pdfkit";
import {sendEmail} from "../email-service";
import {sendReceiptTemaplate} from "../../utils/email-templates";
import {CLOUD_KEY, CLOUD_NAME, CLOUD_SECRET} from "../../constants";

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUD_SECRET,
});


export async function createReceiptCategoryHandler(req: Request<{}, {}, ReceiptBody>, res: Response, next: NextFunction) {
    const { name, description } = req.body
    const { email } = res.locals.user;
    try {
        //Confirm logged in user exist
        const user = await findUserByEmail(email);
        if(!user) throw 'User not found';

        if(!name) throw 'Receipt category is required';
        if(!description) throw 'Receipt description is required';

        const isExist = await findReceiptByCategory(name);
        if(isExist) throw 'Receipt category already added';

        const receipt = await createReceiptCategory({ name, description });
        return apiResponse(res, 'Receipt category created successfully', receipt, 201);
    } catch (err) {
        next(err)
    }
}

export async function getAllReceiptHandler(req: Request<{}, {}, ReceiptBody>, res: Response, next: NextFunction) {

    const { email } = res.locals.user;
    try {
        //Confirm logged in user exist
        const user = await findUserByEmail(email);
        if(!user) throw 'User not found';

        const receipt = await findAllReceipt();
        return apiResponse(res, 'Receipt categories fetch successfully', receipt, 201);
    } catch (err) {
        next(err)
    }
}

export async function generateReceiptHandler(req: Request, res: Response, next: NextFunction) {
    const { category, dueDate, amount, description, recipients } = res.locals.transactionInfo;
    // Format the due date
    const formattedDueDate = new Date(dueDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers for PDF
    res.setHeader('Content-Disposition', 'attachment; filename="receipt.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    // Add content to the PDF
    doc.fontSize(20).text(category + ' Receipt Payment', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Next payment due date is: ' + formattedDueDate, { align: 'left' });
    doc.moveDown();
    doc.text('Amount paid is: N '+amount, { align: 'left' });
    doc.moveDown();
    doc.text('Thank you for your payment!', { align: 'center' });
    doc.text(description, { align: 'center' });

    // Add watermark to the PDF
    doc.fillOpacity(0.3); // Adjust opacity of the watermark
    doc.fontSize(48); // Adjust size of the watermark
    doc.fillColor('gray'); // Adjust color of the watermark
    doc.rotate(-45, { origin: [100, 200] }); // Adjust angle of the watermark (in degrees)
    doc.text('CONFIDENTIAL', 100, 300); // Adjust x and y coordinates of the watermark

    // Finalize the PDF and end the response
    doc.end();

    // Capture the PDF content in a buffer
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Attach the PDF to the response.locals so that it can be accessed by the next middleware
        res.locals.receiptDetailsInfo = { category, dueDate, amount, description, recipients, pdfBuffer };
        next();

    });

}


export async function sendReceiptEmailHandler(req: Request<{}, {}, ReceiptBody>, res: Response, next: NextFunction) {
    const { category, dueDate, amount, description, recipients, pdfBuffer } = res.locals.receiptDetailsInfo
    const attachments = [
        {
            filename: 'receipt.pdf',
            content: pdfBuffer, // Use the PDF buffer from the response locals
            contentType: 'application/pdf',
        },
    ];

    const receiptDetail = { category, dueDate, amount, description, recipients, pdfBuffer }



    for (const recipient of recipients) {
        await sendReceiptEmail(recipient.email, receiptDetail, attachments);
    }
    res.locals.receiptUploadInfo = receiptDetail;

    next();
}

export async function uploadReceiptHandler(req: Request<{}, {}, ReceiptBody>, res: Response, next: NextFunction) {
    const {recipients, pdfBuffer} = res.locals.receiptUploadInfo;


    try {
        // Upload the receipt to Cloudinary using the 'upload_stream' method
        cloudinary.uploader.upload_stream(
            { resource_type: 'raw' },
            (error, result) => {
                // Handle the Cloudinary upload response
                if (result?.secure_url) {
                    // Cloudinary receipt uploaded image URL
                    const cloudinaryURL = result.secure_url;

                    // Return the Cloudinary receipt uploaded image URL and the transaction recipients
                    res.locals.updateTransactionInfo = {
                        receiptURL: cloudinaryURL,
                        recipients
                    }

                    next();

                } else {
                    // If Cloudinary upload failed, return an error response
                    return apiResponse(res, 'Failed to upload receipt to Cloudinary', '', 500);
                }
            }
        ).end(pdfBuffer);

        // Remove the res.locals.uploadedFiles line as it is no longer needed

    } catch (error) {
        // Handle any errors that occur during the Cloudinary upload process
        return apiResponse(res, 'Error uploading receipt to Cloudinary', '', 500);
    }
}





export const sendReceiptEmail = async (recipient: string, receiptDetail: any, attachments) => {
    return await sendEmail(recipient, `${receiptDetail.category} payment receipt`,
        sendReceiptTemaplate(receiptDetail), attachments);
}
