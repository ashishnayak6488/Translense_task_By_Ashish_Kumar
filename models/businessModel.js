const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    openingTime: {
      type: Date,
    },
    closingTime: {
      type: Date,
    },
    restaurantPic: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    otp: {
      type: Number,
    },
    otpvalidity: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
