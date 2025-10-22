const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
const testEmailConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
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
};

async function testEmailConnection() {
  console.log('🔧 Testing SMTP Configuration...');
  console.log('MAIL_USER:', process.env.MAIL_USER);
  console.log('MAIL_PASS:', process.env.MAIL_PASS ? '***hidden***' : 'NOT SET');
  
  const transporter = nodemailer.createTransport(testEmailConfig);
  
  try {
    // Test connection
    console.log('\n📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Test sending email
    console.log('\n📧 Testing email sending...');
    const testEmail = {
      from: process.env.MAIL_USER || 'no-reply@e-tracka.com',
      to: 'winterlinkstan@gmail.com', // Change this to your test email
      subject: 'Test Email - SMTP Configuration',
      html: `
        <h2>🎉 Email Test Successful!</h2>
        <p>This is a test email to verify that the SMTP configuration is working properly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: smtp.gmail.com</li>
          <li>Port: 465</li>
          <li>Secure: true</li>
          <li>Connection Timeout: 60s</li>
        </ul>
        <p>If you receive this email, your SMTP setup is working correctly! 🚀</p>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. MAIL_USER environment variable is set correctly');
      console.log('2. MAIL_PASS is using an App Password (not regular password)');
      console.log('3. 2FA is enabled on your Gmail account');
      console.log('4. App Password is generated correctly');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection timeout. Please check:');
      console.log('1. Network connectivity');
      console.log('2. Firewall settings');
      console.log('3. Gmail SMTP server availability');
    }
  }
}

// Run the test
testEmailConnection()
  .then(() => {
    console.log('\n🏁 Email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
