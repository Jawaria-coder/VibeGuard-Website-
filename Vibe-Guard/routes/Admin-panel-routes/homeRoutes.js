const express = require('express');
const router = express.Router();
const BodyPart = require('../../models/BodyPart');
const Medicine = require('../../models/Medicine');
const Symptom = require('../../models/Symptom');
const SymptomDetail = require('../../models/SymptomDetail');
const Doctor = require('../../models/Doctors');
const User = require('../../models/User/user.model');
const feedback = require("../../models/User-Things/feedback.model");
const isAuthenticated = require('../../middlewares/admin-middleware');
const { sendSuspensionEmail, sendUnsuspensionEmail }= require('../../utils/sendSuspensionEmail'); 

// Admin Home Route
router.get('/home', isAuthenticated,async (req, res) => {
    try {
        const totalBodyParts = await BodyPart.countDocuments();
        const totalSymptoms = await Symptom.countDocuments();
        const totalDoctors = await Doctor.countDocuments();
        const totalMedicines = await Medicine.countDocuments();
        const totalSymptomDetails = await SymptomDetail.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalfeedbacks = await feedback.countDocuments();
    
        // Pass the totals to the home view
        res.render('Admin-panel/home', {
            totalBodyParts,
            totalSymptoms,
            totalDoctors,
            totalMedicines,
            totalSymptomDetails,
            totalUsers,
            totalfeedbacks,
        });
    } catch (error) {
        console.error('Error fetching data for home:', error);
        res.status(500).send('Error fetching data.');
    }
});

// Admin Users Route
router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;    
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Extract messages from query params for alerts
    const { message, type } = req.query;

    const totalPages = Math.ceil(total / limit);

    res.render('Admin-panel/Users', {
      users,
      message: message || null,
      messageType: type || null,
      currentPage: page,
      totalPages,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users.');
  }
});



// Suspend or Unsuspend a User

router.post('/users/:id/suspend', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found.');

    const now = new Date();
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    if (!user.suspended) {
      // Trying to suspend user, so check lastLogin first
      if (!user.lastLogin || user.lastLogin > fiveMonthsAgo) {
        // lastLogin is either missing or within 5 months, no valid reason
        return res.redirect('/admin/users?message=Last login is not more than 5 months&type=error');
      }
      // else lastLogin older than 5 months -> suspend allowed
      user.suspended = true;
      await user.save();
      await sendSuspensionEmail(user.email, user.username);
      return res.redirect('/admin/users?message=User suspended and notified&type=success');
    } else {
      // User is currently suspended -> unsuspend directly
      user.suspended = false;
      await user.save();
      await sendUnsuspensionEmail(user.email, user.username);
      return res.redirect('/admin/users?message=User unsuspended and notified&type=success');
    }
  } catch (error) {
    console.error('Error suspending user:', error);
    return res.redirect('/admin/users?message=Error suspending user&type=error');
  }
});




// Export the router
module.exports = router;
