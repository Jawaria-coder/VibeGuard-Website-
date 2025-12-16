const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../../models/User/user.model");
const sendVerificationEmail = require('../../utils/mailer'); 
const crypto = require('crypto');
const Info = require('../../models/User-Things/BasicInfo');
const authenticateUser = require("../../middlewares/localuser-middleware");
const verificationCodes = new Map();
const upload = require("../../middlewares/upload"); 
const fs = require("fs");
const path = require("path");
const { sendPasswordResetConfirmation ,sendPasswordResetOTP} = require("../../utils/passwordchange");


// Render Login/Register Page
router.get("/register", (req, res) => {
  const message = req.query.message || null;
  res.render("Register/login-register", { layout: false, error: message, success: null });
});

// Register / Create user route
router.post('/create', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!email.includes('@')) {
    return res.render('Register/login-register', {
      layout: false,
      error: "Invalid email. Email must contain '@'.",
      success: null,
    });
  }

  if (password.length < 8) {
    return res.render('Register/login-register', {
      layout: false,
      error: 'Password must be at least 8 characters long.',
      success: null,
    });
  }

  if (password !== confirmPassword) {
    return res.render('Register/login-register', {
      layout: false,
      error: 'Passwords do not match.',
      success: null,
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    const code = crypto.randomInt(100000, 999999).toString();
    verificationCodes.set(email, code);

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.render('Register/login-register', {
          layout: false,
          error: 'Email already registered. Please log in.',
          success: null,
          isResetFlow: false
        });
      } else {
        try {
          await sendVerificationEmail(email, code);
        } catch (err) {
          console.error('Email send error:', err);
          return res.render('Register/login-register', {
            layout: false,
            error: 'Failed to send verification email. Please try again.',
            success: null,
            isResetFlow: false
          });
        }

        return res.render('Register/verify-email', {
          layout: false,
          email,
          error: null,
          message: 'Verification code resent. Please check your email.',
          isResetFlow: false
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await userModel.create({ username, email, password: hashedPassword, isVerified: false });

    try {
      await sendVerificationEmail(email, code);
    } catch (err) {
      console.error('Email send error:', err);
      return res.render('Register/login-register', {
        layout: false,
        error: 'Failed to send verification email. Please try again.',
        success: null,
        isResetFlow: false
      });
    }

    res.render('Register/verify-email', {
      layout: false,
      email,
      error: null,
      message: 'Verification code sent to your email.',
      isResetFlow: false
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.render('Register/login-register', {
      layout: false,
      error: 'An error occurred during registration. Please try again.',
      success: null,
      isResetFlow: false
    });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.render("Register/login-register", {
        layout: false,
        error: "Invalid email or password.",
        success: null,
      });
    }

    if (user.suspended) {
      return res.render("Register/login-register", {
        layout: false,
        error: "Your account is suspended. Please contact support.",
        success: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("Register/login-register", {
        layout: false,
        error: "Invalid email or password.",
        success: null,
      });
    }

    if (!user.isVerified) {
      return res.render('Register/login-register', {
        layout: false,
        error: 'Please verify your email first. Check your inbox.',
        success: null,
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role || "user" },
      "shhhh",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    if (user.role === "admin") {
      return res.render("Admin-panel/admin", { username: user.username });
    }

    res.redirect("/tracking/dashboard");

  } catch (error) {
    console.error("Login error:", error);
    res.render("Register/login-register", {
      layout: false,
      error: "An error occurred. Please try again.",
      success: null,
    });
  }
});

// Logout User
router.get("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});


// Reset Password
router.post("/resetpassword", async (req, res) => {

  try {
    const { email, currentPassword, newPassword } = req.body;
    console.log("Received:", { email, currentPassword, newPassword });

    // Step 1: Validate email format
    if (!email.includes("@")) {
      return res.redirect("/login/profile?error=Invalid email format.");
    }

    // Step 2: Validate new password length
    if (!newPassword || newPassword.length < 8) {
      return res.redirect("/login/profile?error=New password must be at least 8 characters long.");
    }

    // Step 3: Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
   
      return res.redirect("/login/profile?error=Error! Email or password incorrect.");
    }
   

    // Step 4: Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      
      return res.redirect("/login/profile?error=Incorrect current password.");
    }
   

    // Step 5: Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    await user.save();

    
    return res.redirect("/login/profile?success=Password updated successfully!");

  } catch (error) {
    return res.redirect("/login/profile?error=An error occurred. Please try again.");
  }
});

// POST: Forgot Password — generate OTP + JWT + send email
router.post('/forgotpassword', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.render('Register/login-register', {
        layout: false,
        error: 'No user found with this email.',
        success: null,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

    const payload = {
      email,
      newPassword,
      otp,
    };

    const token = jwt.sign(payload, 'shhh', { expiresIn: '10m' });
    await sendPasswordResetOTP(email, otp);

    // ✅ FIXED: Redirect to the correct reset page
    return res.redirect(`/login/reset-password/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  } catch (err) {

    return res.render('Register/login-register', {
      layout: false,
      error: 'Something went wrong. Try again.',
      success: null,
    });
  }
});


// GET: Show OTP input form
router.get('/reset-password/verify', (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) return res.redirect('/login/login');

  res.render('Register/verify-email', {
    email,
    token,
    error: null,
    message: null,
    isResetFlow: true,
    layout: false,
  });
});


// POST: Handle OTP submission + reset password
router.post('/reset-password/verify', async (req, res) => {
  const { code, email, token } = req.body;

  if (!token || !code || !email) {
    return res.render('Register/verify-email', {
      email,
      token,
      isResetFlow: true,
      error: 'All fields are required.',
      message: null,
      layout: false,
    });
  }

  try {
    const decoded = jwt.verify(token, 'shhh');

    if (decoded.email !== email) {
      return res.render('Register/verify-email', {
        email,
        token,
        isResetFlow: true,
        error: 'Email mismatch.',
        message: null,
        layout: false,
      });
    }

    if (decoded.otp !== code.trim()) {
      return res.render('Register/verify-email', {
        email,
        token,
        isResetFlow: true,
        error: 'Invalid verification code.',
        message: null,
        layout: false,
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.render('Register/verify-email', {
        email,
        token,
        isResetFlow: true,
        error: 'User not found.',
        message: null,
        layout: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(decoded.newPassword, salt);
    await user.save();

    await sendPasswordResetConfirmation(email);

    return res.render('Register/login-register', {
      layout: false,
      success: 'Password reset successful. You can now log in.',
      error: null,
    });

  } catch (err) {
    return res.render('Register/verify-email', {
      email,
      token,
      isResetFlow: true,
      error: 'Expired or invalid link. Please try again.',
      message: null,
      layout: false,
    });
  }
});


// Original registration email verification (unchanged)
router.get('/verify-email', (req, res) => {
  const email = req.query.email;
  if (!email) return res.redirect('/login/register');
  res.render('Register/verify-email', {
    email,
    error: null,
    message: null,
    layout: false,
    isResetFlow: false
  });
});

router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.render('Register/verify-email', {
      email,
      error: 'Please enter the verification code.',
      message: null,
      layout: false,
      isResetFlow: false
    });
  }

  const savedCode = verificationCodes.get(email);
  if (!savedCode || savedCode !== code.trim()) {
    return res.render('Register/verify-email', {
      email,
      error: 'Invalid verification code. Please try again.',
      message: null,
      layout: false,
      isResetFlow: false,
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.render('Register/login-register', {
        layout: false,
        error: 'User not found. Please register again.',
        success: null,
        isResetFlow: false
      });
    }

    user.isVerified = true;
    await user.save();
    verificationCodes.delete(email);

    res.render('Register/login-register', {
      layout: false,
      error: null,
      success: 'Email verified successfully! You can now log in.',
      isResetFlow: false
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.render('Register/verify-email', {
      email,
      error: 'An error occurred during verification. Please try again.',
      message: null,
      layout: false,
      isResetFlow: false
    });
  }
});

router.get('/profile', authenticateUser, async (req, res) => {
  const info = await Info.findOne({ userId: req.user._id });

  res.render("profile", {
    layout: false,
    user: req.user,
    info: info || {
      age: "N/A",
      gender: "N/A",
      firstName: "Not Provided",
      lastName: "",
      image: "default.png"
    },
    error: req.query.error || null,
    success: req.query.success || null,
  });
});


router.post("/profile/update", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.render("profile", {
        layout: false,
        user: null,
        info: null,
        success: null,
        error: "User not found.",
      });
    }

    const { firstName, lastName, age, gender, bio, username } = req.body;
    const image = req.file ? req.file.filename : null;

    user.username = username || user.username;
    user.bio = bio || user.bio;
    await user.save();

    let info = await Info.findOne({ userId: user._id });
    if (!info) {
      info = new Info({ userId: user._id });
    }

    info.firstName = firstName || info.firstName;
    info.lastName = lastName || info.lastName;
    info.age = age || info.age;
    info.gender = gender || info.gender;
    if (image) info.image = image;

    await info.save();

    const updatedUser = await userModel.findById(user._id);
    const updatedInfo = await Info.findOne({ userId: user._id });

    res.render("profile", {
      layout: false,
      user: updatedUser,
      info: updatedInfo,
      success: "Profile updated successfully!",
      error: null
    });
  } catch (err) {
    res.render("profile", {
      layout: false,
      user: null,
      info: null,
      success: null,
      error: "Error while updating profile."
    });
  }
});


router.post("/profile/delete", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login/register");

    const decoded = jwt.verify(token, "shhhh");
    const userId = decoded._id;

    await userModel.findByIdAndDelete(userId);
    await Info.findOneAndDelete({ userId });

    res.clearCookie("token");
    res.redirect("/login/register");
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).send("Server Error");
  }
});




module.exports = router;