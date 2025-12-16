const express = require('express');
const router = express.Router();
const Medicine = require('../../models/Medicine');
const Symptom = require('../../models/Symptom'); 
const isAuthenticated = require('../../middlewares/admin-middleware');

router.get('/add',isAuthenticated, async (req, res) => {
    try {
      // Fetch all symptoms from the database
      const symptoms = await Symptom.find();
      res.render('Admin-panel/Medicines/addMedicine', { symptoms }); 
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      res.status(500).send('Error fetching symptoms');
    }
  });
  


  router.post('/create',isAuthenticated, async (req, res) => {
    try {
      const { symptomId, medicines } = req.body;
  
      if (!symptomId || !medicines || medicines.length === 0) {
        return res.status(400).send('Symptom ID and medicines are required.');
      }
  
      // Parse the medicines data
      const parsedMedicines = JSON.parse(medicines);
  
      // Create new medicine entry for each medicine
      const newMedicines = parsedMedicines.map(med => ({
        symptomId,
        name: med.name,
        dose: med.dose,
        description: med.description || ''  // You may choose to add a description if necessary
      }));
  
      // Insert new medicines into the database
      await Medicine.insertMany(newMedicines);
  
      res.redirect('/medicine/read');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error saving medicine data.');
    }
  });
  
  
  router.get('/read', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // Current page, default 1
    const limit = parseInt(req.query.limit) || 10;   // Items per page, default 10
    const skip = (page - 1) * limit;

    const total = await Medicine.countDocuments();

    const medicines = await Medicine.find()
      .populate('symptomId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.render('Admin-panel/Medicines/Medicine-read', {
      medicines,
      currentPage: page,
      totalPages,
      limit,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching medicines');
  }
});


  // Route to display the edit medicine form
router.get('/edit/:id',isAuthenticated, async (req, res) => {
  try {
    const medicineId = req.params.id;

    // Fetch the specific medicine and list of symptoms
    const medicine = await Medicine.findById(medicineId).populate('symptomId');
    const symptoms = await Symptom.find();

    if (!medicine) {
      return res.status(404).send("Medicine not found.");
    }

    res.render('Admin-panel/Medicines/editMedicine', { medicine, symptoms });
  } catch (error) {
    console.error('Error fetching medicine for editing:', error);
    res.status(500).send('Error fetching medicine.');
  }
});

// Route to handle updates to the medicine
router.post('/edit/:id',isAuthenticated, async (req, res) => {
  try {
    const medicineId = req.params.id;
    const { symptomId, name, dose, description } = req.body;

    // Validate input
    if (!symptomId || !name || !dose) {
      return res.status(400).send('Symptom, name, and dose are required fields.');
    }

    // Update the medicine in the database
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      medicineId,
      { symptomId, name, dose, description },
      { new: true }
    );

    if (!updatedMedicine) {
      return res.status(404).send("Medicine not found.");
    }

    res.redirect('/medicine/read');
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).send('Error updating medicine.');
  }
});


  // DELETE route to remove a medicine by ID
router.get('/delete/:id',isAuthenticated, async (req, res) => {
  try {
    const medicineId = req.params.id;

    const deletedMedicine = await Medicine.findOneAndDelete({ _id: medicineId });

    if (!deletedMedicine) {
      return res.status(404).send("Medicine not found.");
    }

    // Redirect with success query param
    res.redirect('/medicine/read?deleted=true');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting the medicine.");
  }
});

  
  
  

// Export the router
module.exports = router;
