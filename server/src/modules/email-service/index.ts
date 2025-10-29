import * as Brevo from '@getbrevo/brevo';
import { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } from '../../constants';

interface Attachment {
  filename: string;
  content: string;
  contentType: string;
}

const defaultSenderEmail = BREVO_SENDER_EMAIL || 'no-reply@e-tracka.com';
const defaultSenderName = BREVO_SENDER_NAME || 'E-Tracka';

// Initialize Brevo API client
const apiInstance = new Brevo.TransactionalEmailsApi();

// Only set API key if it exists to avoid TypeScript error
if (!BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY must be set in environment variables');
}
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

/**
 * Email service that sends transactional emails using Brevo API.
 * @export
 * @param {string} toEmail - Recipient's email address
 * @param {string} subject - Subject of email
 * @param {string} html - HTML content of email
 * @param {Attachment[]} [attachments] - Optional attachments
 * @return {Promise<void>}
 */
export async function sendEmail(toEmail: string, subject: string, html: string, attachments?: Attachment[]) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
  }

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: defaultSenderName,
    email: defaultSenderEmail
  };
  sendSmtpEmail.to = [{
    email: toEmail
  }];

  if (attachments?.length) {
    sendSmtpEmail.attachment = attachments.map(attachment => ({
      name: attachment.filename,
      content: attachment.content,
      type: attachment.contentType
    }));
  }

  // Retry logic for email sending
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Email attempt ${attempt}/${maxRetries}`);
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
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
