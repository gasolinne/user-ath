const express = require("express");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const mw_convertPayload2Lowercase = require("../middlewares/convertPayload2Lowercase.js");
const verifySession = require("../middlewares/verifySession.js");
const nodemailer = require("nodemailer");

const router = express.Router();

// nodemailer transporter confiq
var transporter = nodemailer.createTransport({
  host: process.env?.host || "mail.lily-factory.live",
  //   host: process.env?.host || "lily-factory.live",
  port: 465, // 587, //25
  //   secure: true, // Use SSL or TLS depending on your host
  auth: {
    user: "help@lily-factory.live",
    pass: "help@lily-factory.123",
  },
});

// create account email design and send as function
const sendEmailHERE = async (code, firstName, email) => {
  try {
    const msg = {
      from: "Next Strive <help@lily-factory.live>",
      to: email,
      subject: "One Time Code",
      html: `
       <table align="center" bgcolor="#F9FFF6" border="0" cellpadding="0" cellspacing="0" style="background-color:#f9fff6" width="100%">
      <tbody>
        <tr>
          <td align="center" style="font-family:Inter,arial;color:#474747;font-size:14px">
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="padding:0 5px" width="450">
              <tbody>
                <tr>
                  <td align="center" style="padding:40px 20px 30px 20px;text-align:center;font-size:14px;color:#474747;line-height:24px;font-family:Inter,arial;color:#474747" valign="middle" width="100%">
                    <div  style="width: max-content;margin-left:auto;margin-right:auto; display:flex;align-items:center;justify-contnent:center" > 
                    <img src="https://ik.imagekit.io/7p9j0gn28d3j/favicon__kVP8R9Ue.png" width="40px" alt="logo" />
  
                    <span align="center" style="margin-left: -15px; padding:0 20px;text-align:center;font-size:26px;color:#474747;line-height:30px;font-weight:700;font-family:Inter,arial;color:#fbb500" valign="middle" width="100%">
             nextstrive</span>
                    
                    </div></td>
                </tr>
                
                <tr>
                  <td align="center" style="padding:0 20px;text-align:center;font-size:22px;color: #fbb500;font-family:Tomato Grotesk,arial;line-height:30px;font-weight:600" valign="middle" width="100%">
                    <font><b>Verification Code</b></font></td>
                </tr>
                
                <tr>
                  <td height="30" style="font-family:Inter,arial;color:#474747;font-size:14px" width="100%">
                    &nbsp;</td>
                </tr>
                
                <tr>
                  <td style="padding:0px 20px;font-size:14px;color:#474747;line-height:24px;font-family:Inter,arial;color:#474747" valign="middle" width="100%">
                    Hi ${firstName}</td>
                </tr>
                <tr>
                  <td style="padding:0px 20px;font-size:14px;color:#474747;line-height:24px;font-family:Inter,arial;color:#474747" valign="middle" width="100%">
                    &nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:0px 20px;font-size:14px;color:#474747;line-height:24px;font-family:Inter,arial;color:#474747" valign="middle" width="100%">
                    
                    Verify your account with this one time code. Copy the code below to authorize your device using the activation code below:</td>
                </tr>
                
                <tr>
                  <td height="30" style="font-family:Inter,arial;color:#474747;font-size:14px" width="100%">
                    &nbsp;</td>
                </tr>
                
                <tr>
                  <td align="center" style="padding:0 20px;text-align:center;font-family:Inter,arial;color:#474747;font-size:14px" valign="middle" width="100%">
                    <div style="display:inline-block">
                      <table align="center" border="0" cellpadding="0" cellspacing="0">
                        <tbody>
                          <tr>
                            <td style="font-family:Inter,arial;color:#474747;font-size:14px">
                              <center>
                                <div style="border-radius:30px;font-size:14px;line-height:19px;color:#ffffff;font-weight:bold;background-color:#000000;padding:17px 30px 17px 30px;text-decoration:none" >${code?.toUpperCase()}<div></center>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td height="30" style="font-family:Inter,arial;color:#474747;font-size:14px" width="100%">
                    &nbsp;</td>
                </tr>
                
                <tr>
                  <td style="padding:0px 20px;font-size:14px;color:#474747;line-height:24px;font-family:Inter,arial;color:#474747" valign="middle" width="100%">
                 <span style="color: #fbb500" >  IMPORTANT: </span> Please do not share this email with anyone. The link can only be used once and will expire two hours after this email was sent.
      <br/><br/>
      If you do not know why you have received this email, please delete it
      
      </td>
                </tr>
                <tr>
                  <td style="padding:0px 20px;font-size:14px;color:#474747;line-height:24px;font-family:Inter,arial;color:#474747" valign="middle" width="100%">
                    &nbsp;</td>
                </tr>
                
              </tbody>
            </table>
          </td>
          <td height="30" style="font-family:Inter,arial;color:#474747;font-size:14px" width="100%">
            &nbsp;</td>
        </tr>
        <tr>
          <td align="center" style="text-align:center;font-family:Inter,arial;color:#474747;font-size:14px" valign="middle" width="100%">
            <font color="#888888">
                </font><font color="#888888">
            </font><table align="center" bgcolor="#F9FFF6" border="0" cellpadding="0" cellspacing="0" style="background-color:#f9fff6">
              <tbody>
                <tr>
                  <td height="15" style="font-family:Inter,arial;color:#474747;font-size:14px" width="100%">
                    &nbsp;</td>
                </tr>
                
                <tr>
                  <td height="20" style="font-family:Inter,arial;color:#474747;font-size:14px" width="100%">
                    &nbsp;</td>
                </tr>
              </tbody></table><font color="#888888">
          </font></td></tr>
        <tr>
          <td height="20" style="font-family:Inter,arial;color:#474747;font-size:14px" width="100%">
            &nbsp;</td>
        </tr>
        <tr>
          <td align="center" style="padding:0 20px;text-align:center;font-size:14px;color:#474747;line-height:30px;font-weight:700;font-family:Inter,arial;color: #fbb500" valign="middle" width="100%">
            NEXT STRIVE</td>
        </tr>
        <tr>
          <td align="center" style="padding:0px 20px;text-align:center;color:#474747;font-size:14px;line-height:24px;font-family:Inter,arial;color:#474747" valign="middle" width="100%">
            &nbsp;&nbsp;&nbsp;&nbsp;</td>
        </tr>
      </tbody>
      </table>
  `,
    };

    const mailOptions = {
      from: msg.from,
      to: email,
      subject: msg.subject,
      html: msg.html,
    };

    const dataHere = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("error from registration email =>>> ", error);
  }
};

router.post(
  "/auth/forgotten/password",
  mw_convertPayload2Lowercase,
  async (req, res) => {
    try {
      const { data } = req.body;

      const user = await User.findOne({
        $or: [{ email: data }, { username: data }],
      });

      // console.log("user =>> ", user);

      if (!user) {
        res.status(500).json({
          e: true,
          data: null,
          m: "Invalid credentials provided",
        });
        return;
      }

      const emailCode =
        Math.random().toString().split("")[7] +
        Math.random().toString().split("")[3] +
        Math.random().toString().split("")[4] +
        Math.random().toString().split("")[5] +
        // Math.random().toString(20).split("")[6] +
        // Math.random().toString(20).split("")[7] +
        Math.random().toString().split("")[8];

      const hashedPassword = await bcrypt.hash(emailCode?.toLowerCase(), 10);

      await User.findByIdAndUpdate(
        user._id,
        { password: { hash: hashedPassword, raw: emailCode } },
        { new: true }
      );

      sendEmailHERE(emailCode, user?.full_name, data);

      res.status(201).json({
        e: false,
        m: "Please enter the code sent to your email to proceed with logging in",
        forgottenEmail: data,
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
