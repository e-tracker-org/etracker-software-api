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
  const emailConfig = {
    from: MAIL_USER || 'no-reply@e-tracka.com',
    to: toEmail,
    subject,
    html: context,
    attachments
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
