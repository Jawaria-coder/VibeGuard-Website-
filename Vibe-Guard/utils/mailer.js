const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vibeguard7@gmail.com',
    pass: 'qhrw fwqx bdwb eaqk', 
  },
});

async function sendVerificationEmail(email, code) {
  console.log("📧 Sending email to:", email);
  console.log("🔐 Verification code is:", code);

  return await transporter.sendMail({
    from: '"VibeGuard" <vibeguard7@gmail.com>',
    to: email,
    subject: 'Verify your email - VibeGuard',
    text: `Your verification code is: ${code}`,
  });
}

module.exports = sendVerificationEmail;
