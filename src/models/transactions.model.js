const mongoose = require("mongoose");
const moment = require("moment");

const transactionsSchema = new mongoose.Schema(
  {
    date: { type: String, default: moment().format("lll") },
    uid: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    name: String,
    roi: Number,
    amount: Number,
    funds_from: {
      type: String,
      enum: ["bitcoin", "perfect", "ethereum", "usdt", "litecoin"],
      default: "bitcoin",
    },
    data: [
      {
        data_type: {
          type: String,
          enum: ["deposit", "withdraw"],
          default: "deposit",
        },
        approved_date: String,
        amount: Number,
        status: {
          type: String,
          enum: ["pending", "approved", "cancelled"],
          default: "pending",
        },
      },
    ],
    amount: Number,
    time: String,
    hours: Number,
    min: String,
    max: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("transactions", transactionsSchema);
