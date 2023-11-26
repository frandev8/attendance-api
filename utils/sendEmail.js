const nodemailer = require("nodemailer");

// create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.HOST_NAME,
  port: 465,
  service: process.env.SERVICE,
  secure: true,
  logger: true,
  debug: true,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.PASS,
  },
});

// send employee verification email
const sendEmail = async (email, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.USER_MAIL,
      to: email,
      subject: subject,
      html: `<div>
      <p>Click on the link below to verify.</p>
      <a href="${text}">Verify</a>
    </div>
  `,
    });

    console.log("Message sent successfully", info.messageId);
  } catch (e) {
    console.log(e);
  }
};

module.exports = sendEmail;
