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
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});


export default transporter;