const express = require("express");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const mw_convertPayload2Lowercase = require("../middlewares/convertPayload2Lowercase.js");
const verifySession = require("../middlewares/verifySession.js");

const router = express.Router();

// Register
router.get("/list/referral", verifySession, async (req, res) => {
  try {
    const referrals = await User.countDocuments({ upline: req.user.username });
    const active_referrals = await User.countDocuments({
      upline: req.user.username,
      has_deposit: true,
    });

    res.status(201).json({
      data: {
        referrals,
        active_referrals,
        total_referral_commission: active_referrals * 5,
      },
      e: false,
      m: "✅ User registered",
    });
  } catch (err) {
    console.log("error ==>> ", err);
    res.status(400).json({ e: true, data: null, m: err.message });
  }
});

module.exports = router;
