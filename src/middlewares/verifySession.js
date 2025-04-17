const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const moment = require("moment");

const mw_verify_session = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization)
      throw new Error("invalid user in session, login to continue");
    let token = authorization.split(" ")[1];
    if (!token) throw new Error("session expired, login to continue");

    // Replace "@" with "a"
    let replacedString = token.replace(/@/g, "a");

    // Replace "&" with "i"
    replacedString = replacedString.replace(/&/g, "i");
    // console.log("replacedString here! ==>> ", replacedString);
    // // if no error in session then verify it
    let data = jwt.verify(replacedString, "jwt");
    if (!data) throw new Error("invalid token provided");
    let userExists = await userModel
      .findById(data._id)
      .select(
        "full_name email pendingDeposit username btc_add eth_add usdt_add lite_add perfect secret_question secret_answer upline date last_login ip_address browser_change ad_balance"
      );
    if (!userExists) throw new Error("invalid user in session");
    // if account is suspended then stop the action
    // console.log("userExists => ", userExists);
    // if (userExists.account_status.value === "suspended")
    //   throw new Error("unable to complete action, account is suspended");
    // if (userExists.account_status === "inactive")
    //   throw new Error("unable to complete action, account is inactive");

    let newToken = await jwt.sign(
      {
        _id: userExists._id,
        username: userExists.username,
        email: userExists.email,
        full_name: userExists.full_name,
      },
      "jwt"
    );
    let modifiedJwtString = newToken.replace(/[ai]/g, function (match) {
      return match === "a" ? "@" : "&";
    });

    req.token = modifiedJwtString;
    req.user = userExists;
    // move to the next router mw
    next();
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "internal server error occurred",
    });
  }
};

module.exports = mw_verify_session;