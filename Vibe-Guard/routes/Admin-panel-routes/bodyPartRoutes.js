const express = require('express');
const BodyPart = require('../../models/BodyPart'); 
const upload = require("../../config/multerconfig");

const router = express.Router();
const isAuthenticated = require('../../middlewares/admin-middleware');



router.get('/add',isAuthenticated, (req, res) => {
  res.render('Admin-panel/BodyPart/addBodyPart'); 
});


router.post('/create',isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;


    if (!name || !req.file) {
      return res.status(400).send("Name and image file are required.");
    }

    const imagePath = `/images/${req.file.filename}`;


    await BodyPart.create({
      name,
      image: imagePath,  
    });


    res.redirect('/bodyparts/read');
  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).send("A body part with this name already exists.");
    }
    console.error(error);
    res.status(500).send("Error uploading the file or saving the data.");
  }
});


router.get('/read', async (req, res) => {
  try {
    // Parse page and limit from query params, set defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // Get total count of documents
    const total = await BodyPart.countDocuments();

    // Fetch documents with skip and limit
    const bodyParts = await BodyPart.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Pass pagination info along with bodyParts to the view
    res.render('Admin-panel/BodyPart/BodyParts-read', { 
      layout: true, 
      bodyParts,
      currentPage: page,
      totalPages,
      limit,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching body parts.");
  }
});


// Edit Route: Loads the body part data in the form for editing
router.get('/edit/:id',isAuthenticated, async (req, res) => {
  try {
    const bodyPartId = req.params.id;
    const bodyPart = await BodyPart.findById(bodyPartId);

    if (!bodyPart) {
      return res.status(404).send("Body part not found.");
    }

    res.render('Admin-panel/BodyPart/editBodyPart', { bodyPart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the body part for editing.");
  }
});

// Update Route: Handles the update when the edit form is submitted
router.post('/update/:id',isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const bodyPartId = req.params.id;
    const { name } = req.body;
    let imagePath = req.body.existingImage; // To retain the existing image if no new image is uploaded

    if (req.file) {
      imagePath = `/images/${req.file.filename}`;
    }

    const updatedBodyPart = await BodyPart.findByIdAndUpdate(bodyPartId, {
      name,
      image: imagePath,
    }, { new: true });

    if (!updatedBodyPart) {
      return res.status(404).send("Body part not found.");
    }

    res.redirect('/bodyparts/read');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating the body part.");
  }
});

router.get('/delete/:id',isAuthenticated, async (req, res) => {
  try {
    const bodyPartId = req.params.id;

    // Find the body part by id and delete it
    const deletedBodyPart = await BodyPart.findOneAndDelete({ _id: bodyPartId });

    if (!deletedBodyPart) {
      return res.status(404).send("Body part not found.");
    }

    // Redirect back to the body parts list after deletion with query param
    res.redirect('/bodyparts/read?deleted=true');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting the body part.");
  }
});


module.exports = router;
