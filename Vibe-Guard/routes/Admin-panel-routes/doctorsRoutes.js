const express = require('express');
const router = express.Router();
const Doctor = require('../../models/Doctors');
const BodyPart = require('../../models/BodyPart');
const upload = require('../../config/multerconfig');
const isAuthenticated = require('../../middlewares/admin-middleware');

// Add Doctor Form (GET)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.render('Admin-panel/Doctors/DoctorList', { doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).send('Server error');
  }
});


router.get('/add', isAuthenticated, async (req, res) => {
  res.render('Admin-panel/Doctors/addDoctor'); 
});

router.post('/create', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      city,
      specialization,
      qualification,
      experience,
      satisfactionRate,
      avgTimeToPatients,
      waitTime,
      hospitalAddress,
      fee,
      contact
    } = req.body;

    if (!name || !city || !specialization) {
      return res.status(400).send('Name, city, and specialization are required');
    }

    const newDoctor = new Doctor({
      name,
      city,
      specialization,
      qualification,
      experience,
      satisfactionRate,
      avgTimeToPatients,
      waitTime,
      hospitalAddress,
      fee,
      contact
    });

    await newDoctor.save();
    res.redirect('/doctor/read');
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).send('Error creating doctor');
  }
});

router.get('/read', isAuthenticated, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const [doctors, totalDoctors] = await Promise.all([
      Doctor.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Doctor.countDocuments()
    ]);

    const totalPages = Math.ceil(totalDoctors / limit);

    res.render('Admin-panel/Doctors/DoctorList', {
      doctors,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Error fetching doctors');
  }
});


router.get('/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).send('Doctor not found');
    }

    res.render('Admin-panel/Doctors/editDoctor', {
      doctor
    });
  } catch (error) {
    console.error('Error fetching doctor for edit:', error);
    res.status(500).send('Error fetching doctor');
  }
});


router.post('/update/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      city,
      specialization,
      qualification,
      experience,
      satisfactionRate,
      avgTimeToPatients,
      waitTime,
      hospitalAddress,
      fee,
      contact
    } = req.body;

    const updatedData = {
      name,
      city,
      specialization,
      qualification,
      experience,
      satisfactionRate,
      avgTimeToPatients,
      waitTime,
      hospitalAddress,
      fee,
      contact
    };

    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedDoctor) {
      return res.status(404).send('Doctor not found');
    }

    res.redirect('/doctor/read');
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).send('Error updating doctor');
  }
});

router.get('/delete/:id', async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.redirect('/doctor?deleted=true'); 
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
