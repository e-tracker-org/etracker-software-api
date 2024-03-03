import { EMAIL_VERIFICATION_EXPIRES_IN } from '../../../constants';

interface EmailFormatInterface {
  subject: string;
  context: (token: string) => string;
}

export const emailFormat: EmailFormatInterface = {
  subject: 'Verify Email',

  context: (token): string => `
  Hey there,

  This is to confirm your email.

  Here's your token 
  ${token}

  it will expire in ${EMAIL_VERIFICATION_EXPIRES_IN}.

  Bye!
  `,
};
