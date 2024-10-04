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

let transporter = nodemailer.createTransport({
  host: "mail.e-tracka.com",
  port: 465,
  secure: true, 
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS // zcEG1v*7pB(98G
  },
  default: {
    from: 'no-reply@e-tracka.com',
    name: 'E-Tracker',
    adminMail: 'no-reply@e-tracka.com',
},
});


export default transporter;