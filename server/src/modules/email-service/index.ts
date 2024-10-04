import { GMAIL_USER, MAIL_USER } from '../../constants';
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
    from: MAIL_USER,
    to: toEmail,
    subject,
    html: context,
    attachments
  };

  try {
    await transporter.sendMail(emailConfig);
  } catch (error) {
    throw error;
  }
}
