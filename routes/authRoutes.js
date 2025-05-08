const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const generateToken = require("../Config/JWT");
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
const passport = require("passport");
require("../Config/passportConfig");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

dotenv.config();

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(400).json({ message: "Fill all the entries!" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User Email Already Exists!" });
    }

    const user = new User({ userName, email, password });
    await user.save();
    res
      .status(201)
      .json({ status: "success", message: "Successfully registered!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/getUserDetails", authMiddleware, (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).send("Authorization header missing or malformed");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid or expired token");
    }

    console.log("User decoded from token:", user);
    return res.status(200).json(user);
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user);
      res.status(200).json({ token });
    } else {
      res.status(400).json({ message: "Invalid email or password!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
});

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     console.log({ email: email, password: password });
//     const user = await User.findOne({ email });

//     console.log(user);

//     if (user && (await user.matchPassword(password))) {
//       const otp = crypto.randomInt(100000, 999999).toString();
//       const otpExpiresAt = Date.now() + 10 * 60 * 1000;

//       user.otp = otp;
//       user.otpExpiresAt = otpExpiresAt;
//       await user.save();

//       await sendOTPEmail(email, otp);

//       return res.status(200).json({
//         message: "OTP sent to your email! Please verify to continue.",
//         otpVerificationRequired: true,
//       });
//     } else {
//       return res.status(400).json({ message: "Invalid email or password!" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// });

router.post("/updatePassword", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both current and new passwords are required!" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Incorrect current password!" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/logout", authMiddleware, (req, res) => {
  const { token } = req.body;
  jwt.sign(token, process.env.JWT_SECRET, { expiresIn: 1 }, (logout, err) => {
    if (logout) {
      res.status(200).json({ message: "Successfully Logged Out!" });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  });
});
//  google auth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${REACTNATIVE_FRONTEND_URL}/login/success?token=${token}`);
  }
);
router.get("/login/failed", (req, res) => {
  res.status(401).json({ message: "Login Failed" });
});

module.exports = router;
