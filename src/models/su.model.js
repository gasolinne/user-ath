const { Schema, model, mongoose } = require("mongoose");
const moment = require("moment");

const adminModel = new Schema(
  {
    username: String,
    password: String,
    date: { type: String, default: moment().format("lll") },
  },
  {
    timestamps: true,
  }
);
module.exports = model("su", adminModel);
