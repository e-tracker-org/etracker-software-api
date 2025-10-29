// General configuration
export const PORT = process.env.PORT || 8800;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || `https://etracker-software-frontend-five.vercel.app`;
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || `mongodb://localhost:27017/e-tracker-db`;

// Authentication and security
export const OTP_EXPIRY_DATE_IN_MINUTES = Number(process.env.OTP_EXPIRY_DATE_IN_MINUTES) || 2;
export const JWT_SECRET = process.env.JWT_SECRET || 'thisIsASecret';
export const EXPIRES_IN = process.env.EXPIRES_IN || '7d';
export const EMAIL_VERIFICATION_EXPIRES_IN = process.env.EMAIL_VERIFICATION_EXPIRES_IN || '30mins';

// OAuth configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
export const GOOGLE_CLIENT_REDIRECT_URL = process.env.GOOGLE_CLIENT_REDIRECT_URL ?? '';
export const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET || '';

// Brevo API configuration
export const BREVO_API_KEY = process.env.BREVO_API_KEY ?? '';
export const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'etracka.tech@gmail.com';
export const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'E-Tracka';

// Cloud storage configuration
export const CLOUD_NAME = process.env.CLOUD_NAME ?? '';
export const CLOUD_KEY = process.env.CLOUD_KEY ?? '';
export const CLOUD_SECRET = process.env.CLOUD_SECRET ?? '';


export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;