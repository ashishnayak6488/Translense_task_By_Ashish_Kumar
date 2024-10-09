const twilio = require("twilio");

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const sendSmsOtp = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP code for ${phone} is ${otp}`,
      from: twilioPhone,
      to: `+91${phone}`,
    });
    console.log("OTP sent via SMS:", message.sid);
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send OTP via SMS");
  }
};

module.exports = { sendSmsOtp };
