const express = require("express");
const userController = require("../controllers/businessController");

const router = express.Router();

router.post("/update-business-info", userController.addBusinessInfo);

router.post("/update-owner-info", userController.addOwnerInfo);

router.post("/send-otp-email", userController.sendOtpByEmail);
router.post("/send-otp-phone", userController.sendOtpByPhone);
router.post("/verify-otp-email", userController.verifyEmailOtp);
router.post("/verify-otp-phone", userController.verifyPhoneOtp);

module.exports = router;
