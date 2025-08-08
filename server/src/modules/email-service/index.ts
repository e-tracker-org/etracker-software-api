import { MAIL_USER } from '../../constants';
import resend from '../../utils/resend-config';

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
    // Note: Resend handles attachments differently - you may need to adjust this based on your needs
    attachments
  };

  try {
    await resend.emails.send(emailConfig);
  } catch (error) {
    throw error;
  }
}
