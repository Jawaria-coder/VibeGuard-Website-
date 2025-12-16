const express = require('express');
const Doctor = require('../models/Doctors');
const router = express.Router();

// Render EJS page with all doctors
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page
  const limit = 10; // Doctors per page
  const skip = (page - 1) * limit;

  try {
    const [doctors, totalDoctors] = await Promise.all([
      Doctor.find().skip(skip).limit(limit),
      Doctor.countDocuments()
    ]);

    const totalPages = Math.ceil(totalDoctors / limit);

    res.render('findDoctors', {
      layout: false,
      doctors,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


router.get('/search', async (req, res) => {
  const { location } = req.query;

  try {
   const doctors = await Doctor.find({
  $or: [
    { city: { $regex: new RegExp(location, 'i') } },
    { hospitalAddress: { $regex: new RegExp(location, 'i') } }
  ]
});


    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;