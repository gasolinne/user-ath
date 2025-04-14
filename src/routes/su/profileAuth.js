const mw_convertPayload2Lowercase = require("../../middlewares/convertPayload2Lowercase.js");
const verifyAdminSession = require("../../middlewares/verifyAdminSession.js");
const { Router } = require("express");
const suModel = require("../../models/su.model.js");
const router = Router();

// get su details HERE!
// get su details HERE!
// get su details HERE!
router.get("/get/su/details", verifyAdminSession, async (req, res) => {
  try {
    //   successful
    res.json({
      e: false,
      data: { ...req.admin._doc, password: null },
    });
    return;
  } catch (error) {
    res.status(500).json({
      e: true,
      m: error.message || "unable to complete request",
    });

    console.log("error =>> ", error);
  }
});

// su change username HERE!
// su change username HERE!
// su change username HERE!
router.put(
  "/change/details",
  verifyAdminSession,
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const { username } = req.body;

      const isusername = await suModel.findOne({ username });
      if (isusername) {
        res.status(500).json({
          e: true,
          data: null,
          m: "Username already exists, please use a different one",
        });
        return;
      }

      // update new username
      await suModel.findByIdAndUpdate(
        req.admin?._doc?._id,
        { username },
        { new: true }
      );
      //   console.log("update?._doc after pwdHash =>> ", update?._doc);

      res.status(200).json({
        e: false,
        data: req.adminToken,
        m: "You have successfully changed your account username",
      });
    } catch (error) {
      res.status(500).json({
        e: true,
        m: error.message || "unable to complete request",
      });

      console.log("error =>> ", error);
    }
  }
);

// su change password HERE!
// su change password HERE!
// su change password HERE!
router.post(
  "/change/details",
  verifyAdminSession,
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const { old_password, password } = req.body;

      const findUser = await suModel.findById(req.admin._id)

      if(findUser.password !== old_password){
        res.status(200).json({
          e: true,
          data: null,
          m: "Old password is not correct!",
        });
        return
      }
      // update new pwd
      await suModel.findByIdAndUpdate(
        req.admin?._doc?._id,
        { password },
        { new: true }
      );
      //   console.log("update?._doc after pwdHash =>> ", update?._doc);

      res.status(200).json({
        e: false,
        data: req.adminToken,
        m: "You have successfully changed your account password",
      });
    } catch (error) {
      res.status(500).json({
        e: true,
        m: error.message || "unable to complete request",
      });

      console.log("error =>> ", error);
    }
  }
);

module.exports = router;
