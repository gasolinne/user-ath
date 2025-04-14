const jwt = require("jsonwebtoken");
const suModel = require("../models/su.model");
const moment = require("moment");

const mw_admin_verify_session = async (req, res, next) => {
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
    let userExists = await suModel
      .findById(data._id)
      .select(
        "username _id"
      );
    if (!userExists) throw new Error("invalid user in session");

    let newToken = await jwt.sign(
      {
        _id: userExists._id,
        username: userExists.username,
      },
      "jwt"
    );
    let modifiedJwtString = newToken.replace(/[ai]/g, function (match) {
      return match === "a" ? "@" : "&";
    });

    req.adminToken = modifiedJwtString;
    req.admin = userExists;
    // move to the next router mw
    next();
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "internal server error occurred",
    });
  }
};

module.exports = mw_admin_verify_session;
