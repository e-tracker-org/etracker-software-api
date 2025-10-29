import { OTP_EXPIRY_DATE_IN_MINUTES } from "../constants";
import { sendEmail } from "../modules/email-service";

export async function sendOtp(toEmail: string, otp: string) {
    try {
        const subject = 'Forgot Password OTP';
        const html = `
            <h2>Password Reset OTP</h2>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This OTP will expire in ${OTP_EXPIRY_DATE_IN_MINUTES} minutes.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
        `;

        await sendEmail(toEmail, subject, html);
        return otp;
    } catch (error) {
        throw new Error('Error sending OTP');
    }
}

