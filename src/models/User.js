const mongoose = require("mongoose");
const moment = require("moment");

const userSchema = new mongoose.Schema(
  {
    country: String,
    state: String,
    phone: String,
    totalEarned: {type: Number, default: 0},
    totalWithdrew: {type: Number, default: 0},
    ip_address: {
      type: String,
      enum: ["disabled", "medium", "high", "paranoic"],
      default: "disabled",
    },
    browser_change: {
      type: String,
      enum: ["disabled", "enabled"],
      default: "disabled",
    },
    full_name: { type: String },
    email: { type: String },
    username: { type: String },
    btc_add: { type: String },
    eth_add: { type: String },
    usdt_add: { type: String },
    lite_add: { type: String },
    ad_balance: {type: Number, default: 0},
    perfect: { type: String },
    secret_question: { type: String },
    secret_answer: { type: String },
    has_deposit: { type: Boolean, default: false },
    upline: { type: String },
    date: { type: String, default: moment().format("lll") },
    last_login: { type: String },
    password: {
      hash: { type: String },
      raw: {
        type: String,
        // required: [true, "password field is required"],
        min: [6, "password length must be above 6 characters"],
      },
    },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
