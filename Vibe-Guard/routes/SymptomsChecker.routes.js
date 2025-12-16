const express = require('express');
const mongoose = require('mongoose'); 
const BodyPart = require('../models/BodyPart');
const Symptom = require('../models/Symptom');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctors');
const SymptomDetail = require('../models/SymptomDetail');
const UserSymptom = require('../models/User/UserSymptom');

const  authenticateUser = require('../middlewares/localuser-middleware');

const router = express.Router();


router.get('/read', async (req, res) => {
  try {
    const bodyParts = await BodyPart.find(); 
    res.render('UserRead', { layout: false, bodyParts }); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data.');
  }
});


router.get('/read/:bodyPartId', async (req, res) => {
    try {
      const { bodyPartId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(bodyPartId)) {
        return res.status(400).send('Invalid body part ID');
      }
  
      const symptoms = await Symptom.find({ body_part_id: bodyPartId })
        .populate('body_part_id', 'name');
  
      if (symptoms.length === 0) {
        return res.json([]); 
      }
  
      res.json(symptoms);
    } catch (error) {
      console.error('Error fetching symptoms:', error.message);
      res.status(500).send('Error fetching symptoms');
    }
  });

router.get('/symptom/:symptomId/details', async (req, res) => {
  try {
    const { symptomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(symptomId)) {
      return res.status(400).send('Invalid symptom ID');
    }

    const symptomDetails = await SymptomDetail.findOne({ symptom_id: symptomId });

    if (!symptomDetails) {
      return res.status(404).send('Symptom details not found');
    }

    res.json(symptomDetails);
  } catch (error) {
    console.error('Error fetching symptom details:', error.message);
    res.status(500).send('Error fetching symptom details');
  }
});

router.get('/medicine/read/:symptomId', async (req, res) => {
  try {
    const { symptomId } = req.params;

    // Validate symptomId
    if (!mongoose.Types.ObjectId.isValid(symptomId)) {
      return res.status(400).send('Invalid symptom ID');
    }

    // Fetch medicines related to the symptom, and include the symptom's name
    const medicines = await Medicine.find({ symptomId: symptomId })
      .populate('symptomId', 'name')  // Populate symptom's name
      .select('name description dose symptomId');  // Select relevant fields for better response

    // Check if medicines are found
    if (medicines.length === 0) {
      return res.status(404).send('No medicines found for this symptom');
    }

    // Return medicines in JSON format
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error.message);
    res.status(500).send('Error fetching medicines');
  }
});


router.get('/doctor/read/:bodyPartId', async (req, res) => {
  try {
    const { bodyPartId } = req.params;

    // Check if body part ID is valid
    if (!mongoose.Types.ObjectId.isValid(bodyPartId)) {
      return res.status(400).send('Invalid body part ID');
    }

    // Fetch doctors associated with this body part
    const doctors = await Doctor.find({ bodyPart: bodyPartId }).populate('bodyPart');

    if (doctors.length === 0) {
      return res.status(404).send('No doctors found for this body part');
    }

    // Return doctors in JSON format
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Error fetching doctors');
  }
});


router.post('/symptom/select', authenticateUser, async (req, res) => {
  try {

    const { symptomId, bodyPartId } = req.body;

    const userId = req.user?._id;
 

    if (!userId || !symptomId || !bodyPartId) {
  
      return res.status(400).json({ error: 'Missing required fields' });
    }


    const existing = await UserSymptom.findOne({ userId, symptomId });
    if (existing) {
      return res.status(200).json({ message: 'Symptom already recorded' });
    }

    const entry = new UserSymptom({ userId, symptomId, bodyPartId });
    await entry.save();
    res.status(201).json({ message: 'Symptom recorded successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




  

module.exports = router;
