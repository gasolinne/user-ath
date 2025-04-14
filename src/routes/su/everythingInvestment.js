const express = require("express");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User.js");
const plansModel = require("../../models/plans.model.js");
const mw_convertPayload2Lowercase = require("../../middlewares/convertPayload2Lowercase.js");
const verifySession = require("../../middlewares/verifySession.js");
const transactionsModel = require("../../models/transactions.model.js");
const verifyAdminSession = require("../../middlewares/verifyAdminSession.js");

const router = express.Router();

// Register
router.put(
  "/setup/plans",
  mw_convertPayload2Lowercase,
  verifyAdminSession,
  async (req, res) => {
    try {
      const { plans } = req.body;

      // check and get plans get
      const allplans = await plansModel.find();

      if (allplans?.length < 1) {
        // no plans yet, so create one
        const create = await plansModel.create({ plans });

        res.json({
          data: create,
          e: false,
          m: "✅ successful",
        });
        return;
      }

      // edit the plans there
      const edited = await plansModel.findByIdAndUpdate(
        allplans[0]._id,
        { plans },
        { new: true }
      );
      res.json({
        data: edited,
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

// Approve or cancel deposit
router.put(
  "/action/transaction/:ID",
  mw_convertPayload2Lowercase,
  verifyAdminSession,
  async (req, res) => {
    try {
      const { data } = req.body;

      const getTrans = await transactionsModel.findById(req.params.ID);

      if (!getTrans) {
        return res.status(500).json({
          e: true,
          data: null,
          m: "unable to complete request, can't find the transaction",
        });
      }

      // get the user that has the transaction and update has_deposit to true
      await User.findByIdAndUpdate(
        getTrans?.uid,
        { has_deposit: true },
        { new: true }
      );

      // Get current date in the desired format
      const currentDate = moment().format("lll");

      // Update only deposits with pending status
      getTrans.data.forEach((item) => {
        if (item.data_type === "deposit" && item.status === "pending") {
          item.status = data;
          item.approved_date = currentDate; // Update approved_date
        }
      });

      // Update the main 'date' field to the current date
      getTrans.date = currentDate;

      // Save the updated transaction
      await getTrans.save();

      res.json({
        data: null,
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

// Approve or cancel withdrawals
router.put(
  "/action/withdrawal/transaction/:ID",
  mw_convertPayload2Lowercase,
  verifyAdminSession,
  async (req, res) => {
    try {
      const { data, approved_date, amount } = req.body;

      const getTrans = await transactionsModel.findById(req.params.ID);

      if (!getTrans) {
        return res.status(500).json({
          e: true,
          data: null,
          m: "unable to complete request, can't find the transaction",
        });
      }

      // get the user that has the transaction and update has_deposit to true
      await User.findByIdAndUpdate(
        getTrans?.uid,
        { has_deposit: true },
        { new: true }
      );

      // Get current date in the desired format
      const currentDate = moment().format("lll");

      // Update only deposits with pending status
      getTrans.data.forEach((item) => {
        if (
          item.data_type === "withdraw" &&
          item.status === "pending" &&
          item.approved_date == approved_date &&
          item.amount == amount
        ) {
          item.status = data;
          item.approved_date = currentDate; // Update approved_date
        }
      });
      //       // Update the main 'date' field to the current date
      //       // getTrans.date = currentDate;

      // Save the updated transaction
      await getTrans.save();

      res.json({
        data: null,
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

// delete each user HERE! with there kyc, wallet, and phrase
router.delete("/user/:id", verifyAdminSession, async (req, res) => {
  try {
    const findUser = await User.findById(req.params.id).select("_id");

    if (!findUser) {
      // console.log("deleted old picture here! ");
      res.status(500).json({
        e: true,
        m: "Unable to complete request, can't find user with ID",
      });
      return;
    }

    const deleteKYC = await transactionsModel.deleteMany({ uid: findUser._id });

    await userModel.findByIdAndDelete(findUser._id);

    res.status(200).json({
      e: false,
      m: "Success!",
    });
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "unable to complete request",
    });

    console.log("error =>> ", error);
  }
});

// admin changing each user ad_balance details HERE!
router.put("/user/balance/:id", verifyAdminSession, async (req, res) => {
  try {
    const findUser = await User.findById(req.params.id);
    const { amount } = req.body;

    if (!findUser) {
      // console.log("deleted old picture here! ");
      res.status(500).json({
        e: true,
        m: "Unable to complete request, can't find user with ID",
      });
      return;
    }

    // update the user ad_balance
    await User.findByIdAndUpdate(
      findUser._id,
      { ad_balance: amount },
      { new: true }
    );

    res.status(200).json({
      e: false,
      m: "Success!",
    });
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "unable to complete request",
    });

    console.log("error =>> ", error);
  }
});

module.exports = router;
