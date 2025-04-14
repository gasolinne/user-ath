const verifyAdminSession = require("../../middlewares/verifyAdminSession");
const { Router } = require("express");
const userModel = require("../../models/User");
const transactionsModel = require("../../models/transactions.model");
const router = Router();

// list users HERE!
router.get("/all/users", verifyAdminSession, async (req, res) => {
  try {
    const allUsers = await userModel
      .find()
      .sort({ createdAt: -1 })
      .select("date username email password full_name ad_balance");

    const result = await transactionsModel.aggregate([
      {
        $unwind: "$data", // Flatten the 'data' array to process each item separately
      },
      {
        $group: {
          _id: null,
          pendingWithdrawals: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$data.data_type", "withdraw"] },
                    { $eq: ["$data.status", "pending"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pendingDeposits: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$data.data_type", "deposit"] },
                    { $eq: ["$data.status", "pending"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // console.log("result =>> ", result);

    return res.status(200).json({
      e: false,
      data: allUsers,
      result:
        result.length > 0
          ? result[0]
          : { pendingWithdrawals: 0, pendingDeposits: 0 },
      m: "all users",
    });
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "unable to complete request",
    });

    console.log("error =>> ", error);
  }
});

// list wallets HERE!
router.get("/all/users/deposits", verifyAdminSession, async (req, res) => {
  try {
    const users = await transactionsModel.aggregate([
      // Unwind the 'data' array to work with individual data objects
      { $unwind: "$data" },
      // Match only deposits
      { $match: { "data.data_type": "deposit" } },
      // Add a sorting value for status
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$data.status", "pending"] }, then: 1 },
                { case: { $eq: ["$data.status", "approved"] }, then: 2 },
                { case: { $eq: ["$data.status", "cancelled"] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      // Sort by statusOrder (pending first)
      { $sort: { statusOrder: 1 } },
      // Group back transactions, pushing sorted data into an array
      {
        $group: {
          _id: "$_id",
          uid: { $first: "$uid" },
          name: { $first: "$name" },
          roi: { $first: "$roi" },
          amount: { $first: "$amount" },
          funds_from: { $first: "$funds_from" },
          time: { $first: "$time" },
          hours: { $first: "$hours" },
          min: { $first: "$min" },
          max: { $first: "$max" },
          date: { $first: "$date" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          data: { $push: "$data" }, // Push sorted data back into an array
        },
      },
      // Lookup user details from the users collection
      {
        $lookup: {
          from: "users",
          localField: "uid",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // Unwind user details
      { $unwind: "$userDetails" },
      // Project final output
      {
        $project: {
          _id: 1,
          uid: 1,
          name: 1,
          roi: 1,
          amount: 1,
          funds_from: 1,
          time: 1,
          hours: 1,
          min: 1,
          max: 1,
          date: 1,
          createdAt: 1,
          updatedAt: 1,
          data: 1,
          "userDetails.username": 1,
          "userDetails.email": 1,
          "userDetails._id": 1,
          "userDetails.full_name": 1,
        },
      },
    ]);

    // const users = await transactionsModel
    //   .find(
    //     { "data.data_type": "deposit" } // Filter transactions where at least one data entry has data_type = deposit
    //     // { uid: 1, _id: 0 } // Only select the uid field
    //   )
    //   .populate("uid", "username email full_name") // Populate user details
    //   .sort({ createdAt: -1 });

    // const users = await transactionsModel.find({
    //   "data.data_type": "deposit" // Match only transactions that have deposits
    // })
    //   .populate("uid", "username email full_name") // Populate user details
    //   .lean(); // Convert to plain objects for easier manipulation

    // // Sort the 'data' array within each transaction
    // users.forEach(transaction => {
    //   transaction.data = transaction.data
    //     .filter(d => d.data_type === "deposit") // Ensure only deposits are present
    //     .sort((a, b) => {
    //       const order = { pending: 1, approved: 2, cancelled: 3 };
    //       return order[a.status] - order[b.status]; // Sort status
    //     });
    // });

    // console.log("users =>> ", users);

    return res.status(200).json({
      e: false,
      data: users,
      m: "all phrases",
    });
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "unable to complete request",
    });

    console.log("error =>> ", error);
  }
});

// list wallets HERE!
router.get("/all/users/withdraw", verifyAdminSession, async (req, res) => {
  try {
    const users = await transactionsModel.aggregate([
      // Unwind the 'data' array to work with individual data objects
      { $unwind: "$data" },
      // Match only deposits
      { $match: { "data.data_type": "withdraw" } },
      // Add a sorting value for status
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$data.status", "pending"] }, then: 1 },
                { case: { $eq: ["$data.status", "approved"] }, then: 2 },
                { case: { $eq: ["$data.status", "cancelled"] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      // Sort by statusOrder (pending first)
      { $sort: { statusOrder: 1 } },
      // Group back transactions, pushing sorted data into an array
      {
        $group: {
          _id: "$_id",
          uid: { $first: "$uid" },
          name: { $first: "$name" },
          roi: { $first: "$roi" },
          amount: { $first: "$amount" },
          funds_from: { $first: "$funds_from" },
          time: { $first: "$time" },
          hours: { $first: "$hours" },
          min: { $first: "$min" },
          max: { $first: "$max" },
          date: { $first: "$date" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          data: { $push: "$data" }, // Push sorted data back into an array
        },
      },
      // Lookup user details from the users collection
      {
        $lookup: {
          from: "users",
          localField: "uid",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // Unwind user details
      { $unwind: "$userDetails" },
      // Project final output
      {
        $project: {
          _id: 1,
          uid: 1,
          name: 1,
          roi: 1,
          amount: 1,
          funds_from: 1,
          time: 1,
          hours: 1,
          min: 1,
          max: 1,
          date: 1,
          createdAt: 1,
          updatedAt: 1,
          data: 1,
          "userDetails.username": 1,
          "userDetails.email": 1,
          "userDetails._id": 1,
          "userDetails.btc_add": 1,
          "userDetails.eth_add": 1,
          "userDetails.usdt_add": 1,
          "userDetails.lite_add": 1,
          "userDetails.perfect": 1,
          "userDetails.full_name": 1,
        },
      },
    ]);

    // const users = await transactionsModel
    //   .find(
    //     { "data.data_type": "deposit" } // Filter transactions where at least one data entry has data_type = deposit
    //     // { uid: 1, _id: 0 } // Only select the uid field
    //   )
    //   .populate("uid", "username email full_name") // Populate user details
    //   .sort({ createdAt: -1 });

    // const users = await transactionsModel.find({
    //   "data.data_type": "deposit" // Match only transactions that have deposits
    // })
    //   .populate("uid", "username email full_name") // Populate user details
    //   .lean(); // Convert to plain objects for easier manipulation

    // // Sort the 'data' array within each transaction
    // users.forEach(transaction => {
    //   transaction.data = transaction.data
    //     .filter(d => d.data_type === "deposit") // Ensure only deposits are present
    //     .sort((a, b) => {
    //       const order = { pending: 1, approved: 2, cancelled: 3 };
    //       return order[a.status] - order[b.status]; // Sort status
    //     });
    // });

    // console.log("users =>> ", users);

    return res.status(200).json({
      e: false,
      data: users,
      m: "all withdraws",
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
