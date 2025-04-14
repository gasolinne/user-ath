const express = require("express");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const mw_convertPayload2Lowercase = require("../middlewares/convertPayload2Lowercase.js");
const verifySession = require("../middlewares/verifySession.js");

const router = express.Router();

// Register
router.post("/auth/register", mw_convertPayload2Lowercase, async (req, res) => {
  try {
    const {
      full_name,
      email,
      username,
      btc_add,
      eth_add,
      usdt_add,
      lite_add,
      country,
      state,
      phone,
      perfect,
      secret_question,
      secret_answer,
      upline,
      password,
    } = req.body;

    if (password?.trim()?.length < 6) {
      res.status(500).json({
        e: true,
        data: null,
        m: "Password is too short, update it",
      });
      return;
    }

    // check email
    const isemail = await User.findOne({ email });
    if (isemail) {
      res.status(500).json({
        e: true,
        data: null,
        m: "Email exists, please sign up with a different one to continue",
      });
      return;
    }

    // check username
    const isusername = await User.findOne({ username });
    if (isusername) {
      res.status(500).json({
        e: true,
        data: null,
        m: "Username exists, please sign up with a different one to continue",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      full_name,
      email,
      password: { hash: hashedPassword, raw: password },
      username,
      btc_add,
      country,
      state,
      phone,
      eth_add,
      usdt_add,
      lite_add,
      perfect,
      secret_question,
      secret_answer,
      upline,
    });

    const user = await newUser.save();

    const token = await jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
      "jwt"
    );

    let modifiedJwtString = token.replace(/[ai]/g, function (match) {
      return match === "a" ? "@" : "&";
    });

    res
      .status(201)
      .json({ data: modifiedJwtString, e: false, m: "✅ User registered" });
  } catch (err) {
    console.log("error ==>> ", err);
    res.status(400).json({ e: true, data: null, m: err.message });
  }
});

// Login
router.post("/auth/login", mw_convertPayload2Lowercase, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password.hash))) {
      return res.status(401).json({ e: true, m: "❌ Invalid credentials" });
    }

    user.last_login = moment().format("lll");
    await user.save();

    // const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const token = await jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
      "jwt"
    );

    let modifiedJwtString = token.replace(/[ai]/g, function (match) {
      return match === "a" ? "@" : "&";
    });

    res.json({ data: modifiedJwtString, e: false, m: "✅ successful login" });
  } catch (error) {
    console.log("error ==>> ", error);
    res.status(500).json({
      e: true,
      abdc: "efgh",
      m: error.message || "unable to complete request",
    });
  }
});

// get user information
router.get("/get/details", verifySession, async (req, res) => {
  try {
    //   successful
    res.json({
      e: false,
      //   data: {...req.user._doc, password: null},
      data: { ...req.user._doc },
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

// editing user profile
router.put(
  "/edit/details",
  verifySession,
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const {
        password,
        full_name,
        btc_add,
        eth_add,
        usdt_add,
        lite_add,
        perfect,
        email,
      } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(500).json({
          e: true,
          data: null,
          m: "Can't find user with the provided token",
        });
        return;
      }

      if (email != req.user.email) {
        // check email
        const isemail = await User.findOne({ email });
        if (isemail) {
          res.status(500).json({
            e: true,
            data: null,
            m: "Email exists, please sign up with a different one to continue",
          });
          return;
        }
      }
      if (password) {
        if (password?.trim()?.length < 5) {
          return res.json({
            data: null,
            e: true,
            m: "Password is too short",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = { hash: hashedPassword, raw: password };
        await user.save();
      }

      const updateed = await User.findByIdAndUpdate(
        user._id,
        {
          full_name,
          btc_add,
          eth_add,
          usdt_add,
          lite_add,
          perfect,
          email,
        },
        { new: true }
      );

      const token = await jwt.sign(
        {
          _id: updateed._id,
          username: updateed.username,
          email: updateed.email,
          full_name: updateed.full_name,
        },
        "jwt"
      );

      let modifiedJwtString = token.replace(/[ai]/g, function (match) {
        return match === "a" ? "@" : "&";
      });

      res.json({
        data: modifiedJwtString,
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

// setting user ip_address
router.put(
  "/set/ip_address",
  verifySession,
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const { ip_address } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(500).json({
          e: true,
          data: null,
          m: "Can't find user with the provided token",
        });
        return;
      }

      const updateed = await User.findByIdAndUpdate(
        user._id,
        {
          ip_address,
        },
        { new: true }
      );

      const token = await jwt.sign(
        {
          _id: updateed._id,
          username: updateed.username,
          email: updateed.email,
          full_name: updateed.full_name,
        },
        "jwt"
      );

      let modifiedJwtString = token.replace(/[ai]/g, function (match) {
        return match === "a" ? "@" : "&";
      });

      res.json({
        data: modifiedJwtString,
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

// setting user Browser Change
router.put(
  "/set/browser/change",
  verifySession,
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const { ip_address, browser_change } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(500).json({
          e: true,
          data: null,
          m: "Can't find user with the provided token",
        });
        return;
      }

      const updateed = await User.findByIdAndUpdate(
        user._id,
        {
          browser_change,
          ip_address,
        },
        { new: true }
      );

      const token = await jwt.sign(
        {
          _id: updateed._id,
          username: updateed.username,
          email: updateed.email,
          full_name: updateed.full_name,
        },
        "jwt"
      );

      let modifiedJwtString = token.replace(/[ai]/g, function (match) {
        return match === "a" ? "@" : "&";
      });

      res.json({
        data: modifiedJwtString,
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
