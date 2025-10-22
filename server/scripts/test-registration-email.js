const nodemailer = require('nodemailer');
require('dotenv').config();

// Use environment variables directly
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

// Create transporter with the same config as the email service
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 20000,
  rateLimit: 5
});

// Test the exact same flow as registration
async function testRegistrationEmail() {
  console.log('🔧 Testing Registration Email Flow...');
  console.log('MAIL_USER:', MAIL_USER);
  console.log('MAIL_PASS:', MAIL_PASS ? 'SET' : 'NOT SET');
  
  try {
    // Simulate the same parameters that registration uses
    const testUser = {
      email: 'iceysh.ts@gmail.com',
      firstname: 'Test',
      lastname: 'User'
    };
    
    const testToken = 'test-token-12345';
    
    // Create the same HTML content as registration
    const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://etracker-software-frontend-five.vercel.app';
    const confirmationLink = `${CORS_ORIGIN}/auth/signin?token=${testToken}`;
    const htmlContent = `
      <h4 style="padding-bottom: 0px; margin-bottom: 0px">Dear ${testUser.firstname} ${testUser.lastname}, </h4>
      <p>Thank you for registering with E-tracka. <br/>
      To activate your account and start using our service, please confirm your email address by clicking on the following link or copy and paste it into your browser:<br/>
      
       <a href="${confirmationLink}">${confirmationLink}</a><br/> 
      If you did not register with us, please ignore this email.<br/><br/><br/></p>
     <p>Thank you, <br/>
      E-tracka Team</p>
    `;
    
    console.log('📧 Sending registration email...');
    console.log('To:', testUser.email);
    console.log('Subject: Verify Email');
    
    // Use the same email config as the email service
    const emailConfig = {
      from: MAIL_USER || 'no-reply@e-tracka.com',
      to: testUser.email,
      subject: 'Verify Email',
      html: htmlContent
    };
    
    console.log('Attempting to send email with config:', {
      from: emailConfig.from,
      to: emailConfig.to,
      subject: emailConfig.subject
    });
    
    // Send email with retry logic (same as email service)
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Email attempt ${attempt}/${maxRetries}`);
        const result = await transporter.sendMail(emailConfig);
        console.log('✅ Registration email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('Response:', result.response);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`Error sending email (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
    
  } catch (error) {
    console.error('❌ Registration email test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testRegistrationEmail()
  .then(() => {
    console.log('\n🏁 Registration email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Registration email test failed:', error);
    process.exit(1);
  });
