const Business = require("../models/businessModel");
const Owner = require("../models/ownerModel");
const { sendOTP } = require("../config/sendMail");
const { sendSmsOtp } = require("../config/sendSmsOtp");
const cloudinary = require("cloudinary");

// Add Business Information
exports.addBusinessInfo = async (req, res) => {
  const {
    businessName,
    email,
    phone,
    country,
    state,
    city,
    address,
    openingTime,
    closingTime,
    restaurantPic,
  } = req.body;

  const businessExits = await Business.findOne({
    $or: [{ email: email }, { phone: phone }],
  });

  if (businessExits) {
    return res
      .status(400)
      .json({ error: "Email or Phone Number Already Exists!" });
  }

  let myCloud;
  try {
    myCloud = await cloudinary.v2.uploader.upload(restaurantPic, {
      folder: "translenseRestaurantPic",
    });
  } catch (error) {
    return res.status(500).json({ error: "Cloudinary upload failed" });
  }

  try {
    const business = new Business({
      businessName,
      email,
      phone,
      country,
      state,
      city,
      address,
      openingTime,
      closingTime,
      restaurantPic: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    await business.save();

    return res.status(200).json({
      business,
      message: "Business information updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save business info" });
  }
};

// Add Owner Details
exports.addOwnerInfo = async (req, res) => {
  const { fullName, email, phone, country, state, city, address, profilePic } =
    req.body;

  const OwnerExits = await Owner.findOne({
    $or: [{ email: email }, { phone: phone }],
  });

  if (OwnerExits) {
    return res
      .status(400)
      .json({ error: "Email or Phone Number Already Exists!" });
  }

  let myCloud;
  try {
    myCloud = await cloudinary.v2.uploader.upload(profilePic, {
      folder: "translenseProfilePic",
    });
  } catch (error) {
    return res.status(500).json({ error: "Cloudinary upload failed" });
  }

  try {
    const owner = new Owner({
      fullName,
      email,
      phone,
      country,
      state,
      city,
      address,
      profilePic: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    await owner.save();

    return res.status(200).json({
      owner,
      message: "Owner info Updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save owner info" });
  }
};

// Send OTP via email
exports.sendOtpByEmail = async (req, res) => {
  const { email, userType } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email" });
  }

  try {
    const otp = generateOtp();

    const otpExpiringTime = new Date();
    otpExpiringTime.setMinutes(otpExpiringTime.getMinutes() + 10);

    let user;

    if (userType === "business") {
      user = await Business.findOneAndUpdate(
        { email },
        { otp, otpvalidity: otpExpiringTime },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "Business not found" });
      }
    } else if (userType === "owner") {
      user = await Owner.findOneAndUpdate(
        { email },
        { otp, otpvalidity: otpExpiringTime },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "Owner not found" });
      }
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    sendOTP(email, otp);
    return res.status(200).json({
      otp,
      message: `OTP sent to ${userType} email ${email}!`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Send OTP via Mobile number

//  NOTE- Generally in project I use inbuilt function of firebase,
//  but here I use Twilio services for generating the OTP,
//  for testing purpose it sends the otp only to the verified numbers which are verified on this dashboard
//  otherwise sending the OTP on unverified number we can use paid service
//  so for now testing purpose you can send otp on my contact number that is 9116222113

exports.sendOtpByPhone = async (req, res) => {
  const { phone, userType } = req.body;

  if (!phone || phone.length < 10) {
    return res
      .status(400)
      .json({ error: "Please provide a valid phone number" });
  }
  try {
    const otp = generateOtp();

    const otpExpiringTime = new Date();
    otpExpiringTime.setMinutes(otpExpiringTime.getMinutes() + 10);

    let user;

    if (userType === "business") {
      user = await Business.findOneAndUpdate(
        { phone },
        { otp, otpvalidity: otpExpiringTime },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "Business not found" });
      }
    } else if (userType === "owner") {
      user = await Owner.findOneAndUpdate(
        { phone },
        { otp, otpvalidity: otpExpiringTime },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "Owner not found" });
      }
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    await sendSmsOtp(phone, otp);

    return res.status(200).json({
      otp,
      message: `OTP sent to ${userType}'s phone ${phone}!`,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

// verify otp via email

exports.verifyEmailOtp = async (req, res) => {
  const { email, otp, userType } = req.body;

  if (!otp) {
    return res.status(400).json({ error: "Please provide a valid OTP" });
  }

  try {
    let user;

    if (userType === "business") {
      user = await Business.findOne({ email });
    } else if (userType === "owner") {
      user = await Owner.findOne({ email });
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (!user) {
      return res.status(404).json({
        error: `${
          userType.charAt(0).toUpperCase() + userType.slice(1)
        } not found`,
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const currentTime = new Date();
    const otpExpiryTime = new Date(user.otpvalidity);

    if (currentTime > otpExpiryTime) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};

// verify otp via mobile Number
exports.verifyPhoneOtp = async (req, res) => {
  const { phone, otp, userType } = req.body;

  if (!otp) {
    return res.status(400).json({ error: "Please provide a valid OTP" });
  }

  try {
    let user;

    if (userType === "business") {
      user = await Business.findOne({ phone });
    } else if (userType === "owner") {
      user = await Owner.findOne({ phone });
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (!user) {
      return res.status(404).json({
        error: `${
          userType.charAt(0).toUpperCase() + userType.slice(1)
        } not found`,
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const currentTime = new Date();
    const otpExpiryTime = new Date(user.otpvalidity);

    if (currentTime > otpExpiryTime) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};

// Generates a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
