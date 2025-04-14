const mw_convertPayload2Lowercase = require("../../middlewares/convertPayload2Lowercase");
const { Router } = require("express");
const suModel = require("../../models/su.model");
const router = Router();
const jwt = require("jsonwebtoken");

// LOGIN HERE!
// LOGIN HERE!
// LOGIN HERE!
router.post("/su/login", mw_convertPayload2Lowercase, async (req, res) => {
  try {
    const { password, username } = req.body;

    const user = await suModel.findOne({ username });

    if (!user) {
      res.status(500).json({
        e: true,
        data: null,
        m: "Invalid login credentials provided",
      });
      return;
    }

    if (user.password !== password) {
      res.status(500).json({
        e: true,
        data: null,
        m: "Invalid login credentials provided",
      });
      return;
    }

    const token = await jwt.sign(
      {
        _id: user._id,
        username: user.username,
      },
      "jwt"
    );

    let modifiedJwtString = token.replace(/[ai]/g, function (match) {
      return match === "a" ? "@" : "&";
    });

    return res.status(200).json({
      e: false,
      data: modifiedJwtString,
      m: "sign in successful",
    });
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "unable to complete request",
    });

    console.log("error =>> ", error);
  }
});

// REGISTRATION
// REGISTRATION
// REGISTRATION
router.post("/su/new", mw_convertPayload2Lowercase, async (req, res) => {
  try {
    const { password, username } = req.body;
    // check username
    const isUsername = await suModel.findOne({ username });
    if (isUsername) {
      res.status(500).json({
        e: true,
        data: null,
        m: "Username exists, try with a different one",
      });
      return;
    }

    const newSU = await suModel.create({
      password,
      username,
    });

    const token = await jwt.sign(
      {
        _id: newSU._id,
        username: newSU.username,
      },
      "jwt"
    );

    let modifiedJwtString = token.replace(/[ai]/g, function (match) {
      return match === "a" ? "@" : "&";
    });

    return res.status(200).json({
      e: false,
      data: modifiedJwtString,
      m: "sign up successful",
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
