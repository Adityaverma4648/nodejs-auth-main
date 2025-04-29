// models/GoogleUser.js
const mongoose = require('mongoose');

const googleUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: String,
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GoogleUser', googleUserSchema);
