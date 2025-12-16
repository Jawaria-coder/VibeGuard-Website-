const express = require("express");
const router = express.Router();
const feedback = require("../../models/User-Things/feedback.model");
const  authenticateUser = require('../../middlewares/localuser-middleware');
const isAuthenticated = require('../../middlewares/admin-middleware');
const User = require('../../models/User/user.model');

router.get("/feedback", authenticateUser, async (req, res) => {
    
    const userId = req.user._id; 
    const success = req.query.success === "true"; 
    res.render("UserDashboard/givefeedback",  { layout: false ,success });
});


router.post("/create", authenticateUser, async (req, res) => {
  const userId = req.user._id;
  const feedbackText = req.body.feedbackText;

  if (!feedbackText) {
    return res.status(400).json({ message: "Feedback cannot be empty." });
  }

  try {
    // Fetch the user's name from the DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newFeedback = new feedback({
      user: userId,
      name: user.name || user.username || user.firstName || user.email, // Get whatever exists
      feedback: feedbackText,
    });

    await newFeedback.save();

    res.redirect("/feedback/feedback?success=true");
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ message: "An error occurred while saving feedback." });
  }
});


router.get("/all-feedbacks", isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await feedback.countDocuments();

    const allFeedbacks = await feedback.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    console.log(allFeedbacks);

    res.render("Admin-panel/displayfeedback", {
      layout: true,
      feedbacks: allFeedbacks,
      currentPage: page,
      totalPages,
      limit,
      total,
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "An error occurred while fetching feedbacks." });
  }
});



module.exports = router;