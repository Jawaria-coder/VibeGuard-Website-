const express = require('express');
const router = express.Router();

// Render About Us page
router.get('/', (req, res) => {
  res.render('aboutUs' , {layout: false});
});

module.exports = router;
