import { CORS_ORIGIN } from '../../constants';
import { User } from '../../modules/auth/register/register.model';

export const emailConfirmationLinkTemplate = (user: User, token: string) => {
  const confirmationLink = `${CORS_ORIGIN}/auth/signin?token=${token}`;
  // const confirmationLink = `${
  //   CORS_ORIGIN.split(',')[0] || CORS_ORIGIN.split(',')[2] ? CORS_ORIGIN.split(',')[2] : CORS_ORIGIN
  // }/auth/signin?token=${token}`;
  const html = `
        <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear ${user.firstname} ${user.lastname} </h4>,
        <p>Thank you for registering with E-tracka. <br/>
        To activate your account and start using our service, please confirm your email address by clicking on the following link or copy and paste it into your browser:<br/>
        
         <a href="${confirmationLink}">${confirmationLink}</a><br/> 
        If you did not register with us, please ignore this email.<br/><br/><br/></p>
       <p>Thank you, <br/>
        E-tracka Team</p>
      `;

  return html;
};

export const emailTokenTemplate = (user: User, otp: string) => {
  const html = `
        <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear ${user.firstname} ${user.lastname} </h4>,
        <p>You recently requested to reset your password for your account on E-tracka.<br/>
         Please use the following OTP code to complete the password reset process: <br/>
        <strong>${otp}</strong> <br/></p>
         <p>If you did not request a password reset, please ignore this email</p>
         <p>Thank you, <br/>
        E-tracka Team</p>
      `;

  return html;
};

export const emailTenantPropertyConfirmationLinkTemplate = (user: User, tenantInfo: any) => {
  const confirmationLink = `${CORS_ORIGIN}/auth/signin?tenantId=${tenantInfo?.tenantId}&propertyId=${tenantInfo?.propertyId}`;
  //   const confirmationLink = `${
  //     CORS_ORIGIN.split(',')[0] || CORS_ORIGIN.split(',')[2] ? CORS_ORIGIN.split(',')[2] : CORS_ORIGIN
  // }/auth/signin?tenantId=${tenantInfo?.tenantId}&propertyId=${tenantInfo?.propertyId}`;

  const html = `
        <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear ${user.firstname} ${user.lastname} </h4>,
        <p>
        We are pleased to inform you that you have been assigned as a tenant for the property located at [${tenantInfo?.address}]. As a tenant,
         we kindly request your prompt action to confirm your tenancy and complete the necessary steps, 
         By clicking on the following link or copy and paste it into your browser you are confirming to join the property list<br/>
        
         <a href="${confirmationLink}">${confirmationLink}</a><br/> 
        If you did not register with us, please ignore this email.<br/><br/><br/></p>
       <p>Thank you, <br/>
        E-tracka Team</p>
      `;

  return html;
};

export const inviteTenantLinkTemplate = () => {
  const inviteLink = `${CORS_ORIGIN}/auth/signup`;
  //   const inviteLink = `${
  //     CORS_ORIGIN.split(',')[0] || CORS_ORIGIN.split(',')[2] ? CORS_ORIGIN.split(',')[2] : CORS_ORIGIN
  // }/auth/signup`;
  const html = `
        <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear Tenant</h4>,
        <p>
        We are excited to announce that we have partnered with eTracka, a cutting-edge property management
         platform, to provide you with an enhanced experience as a valued tenant.
        To get started, simply click on the link below to register and set up your eTracka account:<br/>
        
         <a href="${inviteLink}">${inviteLink}</a><br/> <br/><br/>
        If you did not register with us, please ignore this email.<br/><br/><br/></p>
       <p>Thank you, <br/>
        E-tracka Team</p>
      `;

  return html;
};

export const sendReceiptTemaplate = (name: string, receptDetail: any) => {
  const { category, description } = receptDetail;
  const html = `
        <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear Tenant</h4>,
        <p>Thank you for your payment! Attached is the receipt.<br/><br/><br/>
        
        If you did not register with us, please ignore this email.<br/><br/><br/></p>
       <p>Thank you, <br/>
        E-tracka Team</p>
      `;

  return html;
};

export const sendNoticeMessageTemaplate = (mofifyMsg: string, name: string) => {
  const html = `
        <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear ${name},</h4><br/>
        <p>${mofifyMsg}<br/><br/><br/>
        
        If you did not register with us, please ignore this email.<br/><br/></p>
       <p>Thank you, <br/>
        E-tracka Team</p>
      `;

  return html;
};

export const sendEndAgreementTemaplate = (property: string, name: string) => {
  const html = `
        <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear ${name},</h4><br/>
        <p>>We regret to inform you that your tenancy agreement for the property at ${property} has come to an end.<br/><br/><br/>
        
        If you did not register with us, please ignore this email.<br/><br/></p>
       <p>Thank you, <br/>
        E-tracka Team</p>
      `;

  return html;
};
