const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const generateToken = require("../Config/JWT");
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
const passport = require("passport");
require("../Config/passportConfig");

dotenv.config();

const router = express.Router();

router.post("/getUserDetails", authMiddleware, (req, res) => {
  const { token } = req.headers.authorization;
  if (!token) return res.status(400).send("Token is null");
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log(user);
    res.status(200).json(user);
  });
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  const { userName, role, email, password } = req.body;
  if (!userName || !email || !password || !role) {
    return res.status(400).json({ message: "Fill all the entries!" });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User Email Already Exists!" });
    }
    const user = new User({ userName, email, role, password });
    await user.save();
    res
      .status(201)
      .json({ status: "success", message: "Successfully registered!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

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
