const express = require('express');
const Symptom = require('../../models/Symptom');
const BodyPart = require('../../models/BodyPart');

const router = express.Router();
const isAuthenticated = require('../../middlewares/admin-middleware');

// Route to render the 'add symptom' form with available body parts
router.get('/add', isAuthenticated,async (req, res) => {
  try {
    const bodyParts = await BodyPart.find(); 
    res.render('Admin-panel/Symptom/addSymptom', { bodyParts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching body parts.");
  }
});

router.post('/create',isAuthenticated, async (req, res) => {
  try {
    const { name, body_part_id } = req.body;

    // Validate input fields
    if (!name || !body_part_id) {
      return res.status(400).send('Both name and body part are required.');
    }

    // Create a new symptom
    const symptom = new Symptom({ name, body_part_id });
    await symptom.save(); // Save the symptom to the database

    res.redirect('/symptoms/read'); // Redirect to the symptom list page
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving the symptom.');
  }
});

// Route to read and display all symptoms
router.get('/read', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Symptom.countDocuments();

    const symptoms = await Symptom.find()
      .populate('body_part_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.render('Admin-panel/Symptom/Symptom-read', {
      layout: true,
      symptoms,
      currentPage: page,
      totalPages,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching symptoms.');
  }
});

router.get('/edit/:id', isAuthenticated,async (req, res) => {
  try {
    const symptomId = req.params.id;
    const symptom = await Symptom.findById(symptomId).populate('body_part_id');
    const bodyParts = await BodyPart.find();

    if (!symptom) {
      return res.status(404).send("Symptom not found.");
    }

    // Render the edit form with current symptom data and body parts
    res.render('Admin-panel/Symptom/editSymptom', { symptom, bodyParts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching symptom data.");
  }
});

// Route to update the symptom details
router.post('/update/:id',isAuthenticated, async (req, res) => {
  try {
    const symptomId = req.params.id;
    const { name, body_part_id } = req.body;

    // Validate input fields
    if (!name || !body_part_id) {
      return res.status(400).send('Both name and body part are required.');
    }

    // Find and update the symptom
    const updatedSymptom = await Symptom.findByIdAndUpdate(
      symptomId,
      { name, body_part_id },
      { new: true } // Return the updated document
    );

    if (!updatedSymptom) {
      return res.status(404).send("Symptom not found.");
    }

    // Redirect to the symptom list after successful update
    res.redirect('/symptoms/read');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating the symptom.");
  }
});

// Route to delete a symptom by its ID
router.get('/delete/:id',isAuthenticated, async (req, res) => {
  try {
    const symptomId = req.params.id;

    const deletedSymptom = await Symptom.findOneAndDelete({ _id: symptomId });

    if (!deletedSymptom) {
      return res.status(404).send("Symptom not found.");
    }

    // Redirect with success flag
    res.redirect('/symptoms/read?deleted=true');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting the symptom.");
  }
});


module.exports = router;
