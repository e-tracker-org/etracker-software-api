'use strict';
import { MAIL_USER, MAIL_PASS } from '../constants';

const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
// let transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: GMAIL_USER,
//     pass: GMAIL_PASS,
//   },
// });
console.log('MAIL_USER:', MAIL_USER);
console.log('MAIL_PASS:', MAIL_PASS);

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 20000, // 20 seconds
  rateLimit: 5 // max 5 messages per rateDelta
});

// Verify connection configuration
transporter.verify(function(error: any, success: any) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});


export default transporter;