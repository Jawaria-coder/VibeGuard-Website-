const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String, 
    default: "user", 
  },
  suspended: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false,
  },

  
  bio: { type: String, default: '' },
  imageURL: { type: String, default: '/uploads/default.png' },

  createdAt: {
    type: Date,
    default: Date.now
  },
  
  lastLogin: Date,
});

const User = mongoose.model('User', userSchema);
module.exports = User;