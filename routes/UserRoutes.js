const express = require("express");
const User = require("../model/user");
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");

dotenv.config();

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

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

router.post(
  "/upload-profilePicture",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const profilePicPath = req.file.path;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: profilePicPath },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Profile picture uploaded and updated successfully!",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
