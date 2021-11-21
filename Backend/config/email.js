const nodemailer = require("nodemailer");

const mailClient = nodemailer.createTransport({
  host: process.env.MAIL_SERVICE,
  port: process.env.MAIL_SERVICE_PORT,
  auth: {
    user: process.env.MAIL_SERVICE_USER,
    pass: process.env.MAIL_SERVICE_PASSWORD,
  },
});

module.exports = mailClient;
