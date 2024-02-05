const nodemailer = require("nodemailer");

// create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.HOST_NAME,
  port: 465,
  service: process.env.SERVICE,
  secure: true,
  // logger: true,
  debug: true,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.PASS,
  },
});

// send employee verification email
const sendActivationEmail = async (
  activationPageLink,
  activationLink,
  clientInfo,
  token
) => {
  const { firstname, email } = clientInfo;
  try {
    const info = await transporter.sendMail({
      from: process.env.USER_MAIL,
      to: email,
      subject: "Congratulations! Your Account is Ready",
      //     html: `<div>
      //     <p>Click on the link below to verify.</p>
      //     <a href="${text}">Verify</a>
      //   </div>
      // `,
      html: `
      <div>
      <h1>Dear ${firstname},</h1>

      <p>Welcome to Kasapa Broadcast Media, your platform for greater success! You've found the proper frequency and are ready to turn your narrative into a captivating radio broadcast. We're overjoyed to have you on board and can't wait to work together on trips that will have a global impact. This is the beginning of a collaboration in which your voice may truly shine, enthralling viewers. Prepare to capture a future full of impact and growth!</p>
    
      <p>To unlock your full potential with Kasapa Broadcast Media, your account needs a little activation. But don't worry, it's just one click away!</p>
    
      <p>Simply tap on the link below to activate your account and claim your welcome gift:</p>
    
      <a href="${activationLink}" class="button">Activate Your Account Now!</a>
    
      <p>Alternatively, you can manually enter your token:</p>
    
      <p>Your unique token: ${token}</p>
    
      <p>Head over to: ${activationPageLink}</p>
    
      <h2>Once activated, you'll have access to a world of:</h2>
    
      <ul>
        <li>Seamless Clock In/Out: Say goodbye to clunky manual entries. Track your time easily with mobile apps or web interfaces.</li>
        <li>Automated Overtime Calculations: Never miss a minute of earned overtime. Our system takes care of the calculations for you.
        </li>
        <li>Detailed Reports & Analytics: Gain valuable insights into your team's productivity and identify areas for improvement.</li>
      </ul>
    
      <h2>We're Here to Help:</h2>
    
      <p>We're committed to your success, and our team is always here to support you. Feel free to reach out to us at:</p>
    
      <ul>
        <li>Email: francisnyamekye48@gmail.com</li>
        <li>Phone: +233 55462 9099</li>
      </ul>
    
      <p>Welcome to the Kasapa Media family! We're thrilled to have you onboard and can't wait to see what you achieve.</p>
    
      <p>Warmly,</p>
    
      <p>The Kasapa Media Team</p>
      </div>
  `,
    });

    // console.log("Message sent successfully", info.messageId);
  } catch (e) {
    console.log(e);
  }
};

module.exports = { sendActivationEmail };
