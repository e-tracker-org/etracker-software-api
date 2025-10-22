import { MAIL_USER } from '../../constants';
import transporter from '../../utils/nodemailer-config';

interface Attachment {
  filename: string;
  content: any;
  contentType: string;
}

/**
 * email service that configures and sends email with parameters to recipient.
 * @export
 * @param {string} toEmail
 * @param {string} subject subject of email
 * @param {string} html html template of email
 * @return {*}
 */
export async function sendEmail(toEmail: string, subject: string, context: string, attachments?: Attachment[]) {
  // Ensure the 'from' header matches the authenticated SMTP user where possible.
  const fromAddress = MAIL_USER ? `E-Tracka <${MAIL_USER}>` : 'no-reply@e-tracka.com';

  if (!MAIL_USER && process.env.NODE_ENV === 'production') {
    console.warn('MAIL_USER is not set in production. Emails may be rejected by the SMTP server.');
  }

  const emailConfig = {
    from: fromAddress,
    to: toEmail,
    subject,
    html: context,
    attachments,
    // ensure SMTP MAIL FROM uses authenticated user where available to avoid provider rejection
    envelope: {
      from: process.env.MAIL_USER || fromAddress,
      to: toEmail
    }
  };

  console.log('Attempting to send email with config:', {
    from: emailConfig.from,
    to: emailConfig.to,
    subject: emailConfig.subject
  });
  
  console.log('Environment check:', {
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  });

  // Helpful debug: show the 'from' being used vs the authenticated user
  console.log('Email from/header vs MAIL_USER:', { from: emailConfig.from, envelopeFrom: emailConfig.envelope?.from, MAIL_USER: process.env.MAIL_USER });

  // Retry logic for email sending
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Email attempt ${attempt}/${maxRetries}`);
      const result = await transporter.sendMail(emailConfig);
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Error sending email (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('Failed to send email after all retries:', lastError);
  throw lastError;
}
