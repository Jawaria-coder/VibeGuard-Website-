const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vibeguard7@gmail.com',
    pass: 'qhrw fwqx bdwb eaqk', 
  },
});

/**
 * Send suspension notification email
 * @param {string} to - recipient email
 * @param {string} username - user name for personalization
 */
async function sendSuspensionEmail(to, username) {
  const subject = "Account Suspended - VibeGuard";
  const text = `Dear ${username || 'User'},

Your account has been suspended due to inactivity for more than 5 months.

If you believe this is a mistake or want to reactivate your account, please contact support.

Best regards,
VibeGuard Team`;

  console.log("📧 Sending suspension email to:", to);

  return await transporter.sendMail({
    from: '"VibeGuard" <vibeguard7@gmail.com>',
    to,
    subject,
    text,
  });
}

/**
 * Send unsuspension notification email
 * @param {string} to - recipient email
 * @param {string} username - user name for personalization
 */
async function sendUnsuspensionEmail(to, username) {
  const subject = "Account Reactivated - VibeGuard";
  const text = `Dear ${username || 'User'},

Your account has been reactivated. You can now access all features.

Welcome back!

Best regards,
VibeGuard Team`;

  console.log("📧 Sending unsuspension email to:", to);

  return await transporter.sendMail({
    from: '"VibeGuard" <vibeguard7@gmail.com>',
    to,
    subject,
    text,
  });
}

module.exports = {
  sendSuspensionEmail,
  sendUnsuspensionEmail,
};
