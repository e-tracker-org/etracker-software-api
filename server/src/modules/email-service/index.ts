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

  try {
    const result = await transporter.sendMail(emailConfig);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
