const mongoose = require("mongoose");
const moment = require("moment");

const plansSchema = new mongoose.Schema(
  {
    plans: [
      {
        name: String,
        roi: Number,
        time: String,
        hours: Number,
        min: String,
        max: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("plans", plansSchema);

// plans
// min 1500 - 5000
// min 5000 - 10000
// min 10000 - 25000
// min 50000 - unlimited
// 