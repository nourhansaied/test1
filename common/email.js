const nodemailer = require("nodemailer");


let sendEmail = async (destEmail, message, pdfData) => {
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    service: "gmail",
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SENDER_EMAIL, // generated ethereal user
      pass: process.env.SENDER_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL, // sender address
    to: destEmail, // list of receivers
    subject: "Hello ✔", // Subject line
    attachments: [pdfData],
    text: "Hello world?", // plain text body
    html: message, // html body
  });
};

module.exports = sendEmail