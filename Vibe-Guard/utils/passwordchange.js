// utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: 'vibeguard7@gmail.com',
    pass: 'qhrw fwqx bdwb eaqk',  
  },
});

async function sendPasswordResetConfirmation(email) {
  const mailOptions = {
    from: `"VibeGuard" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Password Has Been Changed",
    html: `
      <h3>Password Reset Successful</h3>
      <p>Hello,</p>
      <p>Your password has been successfully changed. If this wasn't you, please contact support immediately.</p>
      <p>Regards,<br>VibeGuard Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordResetOTP(email, otp) {
  const mailOptions = {
    from: `"VibeGuard" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "VibeGuard Password Reset OTP",
    html: `
      <h3>Password Reset Verification</h3>
      <p>Use the following OTP to confirm your password change:</p>
      <h2 style="color:#007bff;">${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>Regards,<br>VibeGuard Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetConfirmation, sendPasswordResetOTP };