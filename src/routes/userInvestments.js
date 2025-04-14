const express = require("express");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transactionModel = require("../models/transactions.model.js");
const plansModel = require("../models/plans.model.js");
const mw_convertPayload2Lowercase = require("../middlewares/convertPayload2Lowercase.js");
const verifySession = require("../middlewares/verifySession.js");
const User = require("../models/User.js");

const router = express.Router();

//  get all plans... admin posted
router.get("/list/plans", verifySession, async (req, res) => {
  try {
    const getData = await plansModel.find();

    res.json({
      data: getData[0],
      e: false,
      m: "✅ successful",
    });
  } catch (error) {
    console.log("error ==>> ", error);
    res.status(500).json({
      e: true,
      abdc: "efgh",
      m: error.message || "unable to complete request",
    });
  }
});

// get all user transactions list
router.get("/all", verifySession, async (req, res) => {
  try {
    const getData = await transactionModel
      .find({ uid: req.user?._id })
      .sort({ createdAt: -1 });
    const plans = await plansModel.find();

    const getAllWithdrawal = await transactionModel.find({
      uid: req.user?._id,
      data: {
        $elemMatch: { data_type: "withdraw", status: "pending" },
      },
    });

    const withdrewTotal = await transactionModel.find({
      uid: req.user?._id,
      data: {
        $elemMatch: { data_type: "withdraw", status: "approved" },
      },
    });


    // console.log("getAllWithdrawal =>> ");
    // console.log("getAllWithdrawal =>> ");
    // console.log("getAllWithdrawal =>> ", getAllWithdrawal);
    // console.log("getAllWithdrawal =>> ");
    // console.log("getAllWithdrawal =>> ");

    res.json({
      data: getData,
      plans: plans[0],
      allPendingWithdrawal: getAllWithdrawal,
      withdrewTotal,
      e: false,
      m: "✅ successful",
    });
  } catch (error) {
    console.log("error ==>> ", error);
    res.status(500).json({
      e: true,
      abdc: "efgh",
      m: error.message || "unable to complete request",
    });
  }
});

// get all user history list
router.get("/history", verifySession, async (req, res) => {
  try {
    const getData = await transactionModel
      .find({ uid: req.user?._id })
      .sort({ createdAt: -1 });
    const plans = await plansModel.find();
    const referrals = await User.find({ upline: req.user.username }).select("full_name email username date");
    const active_referrals = await User.find({
      upline: req.user.username,
      has_deposit: true,
    }).select("full_name email username date");

    const getAllWithdrawal = await transactionModel.find({
      uid: req.user?._id,
      data: {
        $elemMatch: { data_type: "withdraw" },
      },
    });

    res.json({
      data: getData,
      plans: plans[0],
      referrals,
      active_referrals,
      allPendingWithdrawal: getAllWithdrawal,
      e: false,
      m: "✅ successful",
    });
  } catch (error) {
    console.log("error ==>> ", error);
    res.status(500).json({
      e: true,
      abdc: "efgh",
      m: error.message || "unable to complete request",
    });
  }
});

// post deposit or a transactions
router.post(
  "/create",
  verifySession,
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const {
        name,
        roi,
        funds_from,
        data_type,
        amount,
        time,
        hours,
        min,
        max,
      } = req.body;

      const savedata = await transactionModel.create({
        uid: req.user._id,
        name,
        roi,
        amount,
        funds_from,
        time,
        hours,
        min,
        max,
        data: [
          {
            data_type,
            amount,
            status: "pending",
          },
        ],
      });

      res.json({
        data: savedata,
        e: false,
        // m: "Please note that your transaction will be automatically confirmed after 2 blockchain confirmations.",
        m: "The deposit has been saved. It will become active when the administrator checks statistics.",
      });
    } catch (error) {
      console.log("error ==>> ", error);
      res.status(500).json({
        e: true,
        abdc: "efgh",
        m: error.message || "unable to complete request",
      });
    }
  }
);

// withdraw money here for any transaction
router.put(
  "/create",
  verifySession,
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const { funds_from, amount, jsonata } = req.body;

      console.log("req.body =>>> ", req.body);

      const data = await transactionModel.findOne({
        uid: req.user?._id,
        funds_from,
      });

      if (!data) {
        return res.status(500).json({
          e: true,
          data: null,
          m: "Unable to complete request",
        });
      }

      const spreadData = [...data.data];

      spreadData.unshift(jsonata);

      // console.log("spreadData =>> ", spreadData);

      await transactionModel.findByIdAndUpdate(
        data._id,
        {
          data: spreadData,
        },
        { new: true }
      );

      const getData = await transactionModel
        .find({ uid: req.user?._id })
        .sort({ createdAt: -1 });
      const plans = await plansModel.find();

      res.json({
        data: getData,
        plans: plans[0],
        e: false,
        m: "✅ successful",
      });
    } catch (error) {
      console.log("error ==>> ", error);
      res.status(500).json({
        e: true,
        abdc: "efgh",
        m: error.message || "unable to complete request",
      });
    }
  }
);

module.exports = router;
