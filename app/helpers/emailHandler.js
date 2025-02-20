const nodemailer = require("nodemailer");

const sendRegistrationEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registration Successful",
      text: `Hello\n\nYou have successfully registered with us. Welcome!`,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
  }
};

const sendResetEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Hello,\n We received a request to reset your password. Please click the following link to reset your password:\n\n${resetLink}\n\nIf you did not request this change, you can ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending reset email:", err);
  }
};

module.exports = {
  sendRegistrationEmail,
  sendResetEmail,
};
