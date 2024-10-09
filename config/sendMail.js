const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return reject({ success: false, message: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        return resolve({ success: true, message: "OTP sent successfully" });
      }
    });
  });
};

module.exports = { sendOTP };
