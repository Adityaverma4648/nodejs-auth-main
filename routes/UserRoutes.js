const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const generateToken = require("../Config/JWT");
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
const passport = require("../Config/passportConfig");

dotenv.config();

const router = express.Router();


router.post("/updateProfile", authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id; // Assuming authMiddleware sets req.user
      const { name, email } = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email },
        { new: true }
      );
  
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  });

router.post("/profilePicture", authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { profilePictureUrl } = req.body; // Suppose you send image URL from frontend
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePicture: profilePictureUrl },
        { new: true }
      );
  
      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  });

module.export = router;