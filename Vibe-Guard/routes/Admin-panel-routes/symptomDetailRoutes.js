const express = require('express');
const SymptomDetail = require('../../models/SymptomDetail'); 
const Symptom = require('../../models/Symptom'); 

const router = express.Router();
const isAuthenticated = require('../../middlewares/admin-middleware');

router.get('/add',isAuthenticated, async (req, res) => {
  try {
    const symptoms = await Symptom.find(); 
    res.render('Admin-panel/SymptomDetails/addSymptomDetail', { symptoms }); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching symptoms.");
  }
});


router.post('/create',isAuthenticated, async (req, res) => {
  try {
    const {
      overview,
      possibleCauses,
      precautions,
      remedies,
      fact,
      lifestyleTips,
      symptom_id
    } = req.body;

    // Ensure that possibleCauses and other arrays are actually arrays before joining with new lines
    const causesArray = Array.isArray(possibleCauses) ? possibleCauses : [possibleCauses];

    // Join the causes with new lines for separate lines
    const formattedPossibleCauses = causesArray.join('\n'); // Join with newline to separate causes in output

    // Format other fields as needed
    const formattedPrecautions = Array.isArray(precautions) ? precautions.join(', ') : precautions;
    const formattedRemedies = Array.isArray(remedies) ? remedies.join(', ') : remedies;
    const formattedFact = Array.isArray(fact) ? fact.join(', ') : fact;
    const formattedLifestyleTips = Array.isArray(lifestyleTips) ? lifestyleTips.join(', ') : lifestyleTips;

    // Check if all required fields are provided
    if (!overview || !formattedPossibleCauses || !precautions || !remedies || !lifestyleTips || !symptom_id) {
      return res.status(400).send('All fields are required.');
    }

    // Create the new symptom detail object
    const symptomDetail = new SymptomDetail({
      overview,
      possibleCauses: formattedPossibleCauses,
      precautions: formattedPrecautions,
      remedies: formattedRemedies,
      fact: formattedFact,
      lifestyleTips: formattedLifestyleTips,
      symptom_id,
    });

    // Save the symptom details to the database
    await symptomDetail.save();
    
    // Redirect after successful creation
    res.redirect('/symptomDetails/read');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving symptom details.');
  }
});




router.get('/read', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // Default to page 1
    const limit = parseInt(req.query.limit) || 5;   // Default 10 items per page
    const skip = (page - 1) * limit;

    const total = await SymptomDetail.countDocuments();

    const symptomDetails = await SymptomDetail.find()
      .populate('symptom_id', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);
    res.render('Admin-panel/SymptomDetails/SymptomDetail-read', {
      layout: true,
      symptomDetails,
      currentPage: page,
      totalPages,
      limit,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching symptom details.');
  }
});


// Edit route for loading the form with existing symptom details
router.get('/edit/:id', isAuthenticated, async (req, res) => {
  try {
   const symptomDetail = await SymptomDetail.findById(req.params.id).populate('symptom_id', 'name');
    const symptoms = await Symptom.find();

    if (!symptomDetail) {
      return res.status(404).send('Symptom detail not found.');
    }

    res.render('Admin-panel/SymptomDetails/editSymptomDetail', {
      symptomDetail,
      symptoms
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading symptom detail for editing.');
  }
});


// Update route for saving the edited symptom detail
router.post('/update/:id',isAuthenticated, async (req, res) => {
  try {
    const {
      overview,
      possibleCauses,
      precautions,
      remedies,
      fact,
      lifestyleTips,
      symptom_id
    } = req.body;

    // Ensure that possibleCauses and other arrays are actually arrays before joining with new lines
    const causesArray = Array.isArray(possibleCauses) ? possibleCauses : [possibleCauses];
    const formattedPossibleCauses = causesArray.join('\n');

    const formattedPrecautions = Array.isArray(precautions) ? precautions.join(', ') : precautions;
    const formattedRemedies = Array.isArray(remedies) ? remedies.join(', ') : remedies;
    const formattedFact = Array.isArray(fact) ? fact.join(', ') : fact;
    const formattedLifestyleTips = Array.isArray(lifestyleTips) ? lifestyleTips.join(', ') : lifestyleTips;

    if (!overview || !formattedPossibleCauses || !precautions || !remedies || !lifestyleTips || !symptom_id) {
      return res.status(400).send('All fields are required.');
    }

    // Find and update the symptom detail
    const updatedSymptomDetail = await SymptomDetail.findByIdAndUpdate(
      req.params.id,
      {
        overview,
        possibleCauses: formattedPossibleCauses,
        precautions: formattedPrecautions,
        remedies: formattedRemedies,
        fact: formattedFact,
        lifestyleTips: formattedLifestyleTips,
        symptom_id,
      },
      { new: true } // Return the updated document
    );

    if (!updatedSymptomDetail) {
      return res.status(404).send('Symptom detail not found.');
    }

    // Redirect to the list after successful update
    res.redirect('/symptomDetails/read');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating symptom detail.');
  }
});


// DELETE route to remove a symptom detail by ID
router.get('/delete/:id',isAuthenticated, async (req, res) => {
  try {
    const symptomDetailId = req.params.id;

    const deletedSymptomDetail = await SymptomDetail.findOneAndDelete({ _id: symptomDetailId });

    if (!deletedSymptomDetail) {
      return res.status(404).send("Symptom detail not found.");
    }

    // Redirect with success flag
    res.redirect('/symptomDetails/read?deleted=true');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting the symptom detail.");
  }
});


module.exports = router;
