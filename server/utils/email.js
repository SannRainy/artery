// server/utils/email.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

  const transporter = nodemailer.createTransport({
    service: 'SendGrid', 
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY, 
    },
  });

  const mailOptions = {
    from: `Artery Project <${process.env.SENDER_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;