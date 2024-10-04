import transporter from "../utils/nodemailer-config";
import { GMAIL_USER,  MAIL_USER,  OTP_EXPIRY_DATE_IN_MINUTES } from "../constants";

export async function sendOtp(toEmail: string, otp: string) {

    // Define the email message
    const message = {
        from: MAIL_USER,
        to: toEmail,
        subject: 'Forgot Password OTP',
        text: `Your OTP is ${otp}. Expires in ${OTP_EXPIRY_DATE_IN_MINUTES} minutes.`
    };

    try {
        // Send the email
        await transporter.sendMail(message);

        // Return the OTP so it can be verified
        return otp;
    } catch (error) {
        throw new Error('Error sending OTP');
    }
}

