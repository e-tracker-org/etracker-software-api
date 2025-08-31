export const PORT = process.env.PORT || 8800;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || `https://etracker-software-frontend-five.vercel.app`;
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || `mongodb://localhost:27017/e-tracker-db`;
export const GMAIL_USER = process.env.GMAIL_USER;
export const GMAIL_PASS = process.env.GMAIL_PASS;
export const OTP_EXPIRY_DATE_IN_MINUTES = process.env.OTP_EXPIRY_DATE_IN_MINUTES || 2;
export const JWT_SECRET = process.env.JWT_SECRET || 'thisIsASecret';
export const EXPIRES_IN = process.env.EXPIRES_IN || '7d';
export const EMAIL_VERIFICATION_EXPIRES_IN = process.env.EMAIL_VERIFICATION_EXPIRES_IN || '30mins';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CLIENT_REDIRECT_URL = process.env.GOOGLE_CLIENT_REDIRECT_URL;
export const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET || ``;

export const CLOUD_NAME = process.env.CLOUD_NAME;
export const CLOUD_KEY = process.env.CLOUD_KEY;
export const CLOUD_SECRET = process.env.CLOUD_SECRET;


export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;