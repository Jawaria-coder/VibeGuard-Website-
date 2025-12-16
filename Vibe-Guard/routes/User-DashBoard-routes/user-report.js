const express = require('express');
const router = express.Router();
const authenticateUser = require('../../middlewares/localuser-middleware');
const UserSymptom = require('../../models/User/UserSymptom');
const Symptom = require('../../models/Symptom');
const BodyPart = require('../../models/BodyPart');
const PDFDocument = require('pdfkit');
const User = require('../../models/User/user.model');
const Info = require('../../models/User-Things/BasicInfo');
const moment = require('moment');

// generate report for current user
router.get('/symptom/report', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.redirect('/login');

    const records = await UserSymptom.find({ userId })
      .populate('symptomId')
      .populate('bodyPartId');

    const grouped = {};

    records.forEach(record => {
    const bodyPartName = record.bodyPartId?.name || 'Unknown';
    const symptomName = record.symptomId?.name || 'Unnamed Symptom';
    const selectedAt = record.selectedAt;

    if (!grouped[bodyPartName]) grouped[bodyPartName] = [];

    grouped[bodyPartName].push({
        name: symptomName,
        date: moment(selectedAt).format('MMMM Do YYYY, h:mm a')
    });
    });

    const report = Object.entries(grouped).map(([bodyPart, symptoms]) => ({
      bodyPart,
      symptoms
    }));

    res.render('UserDashboard/view-report', { report, layout: false });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/download/pdf', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.redirect('/login');

    // Fetch basic user info
    const userInfo = await Info.findOne({ userId });
    if (!userInfo) return res.status(404).send('User info not found');

    // Fetch symptom records
    const records = await UserSymptom.find({ userId })
      .populate('symptomId')
      .populate('bodyPartId');

    const grouped = {};

    records.forEach(record => {
      const bodyPartName = record.bodyPartId?.name || 'Unknown';
      const symptomName = record.symptomId?.name || 'Unnamed Symptom';
      const selectedAt = record.selectedAt;

      if (!grouped[bodyPartName]) grouped[bodyPartName] = [];

      grouped[bodyPartName].push({
        name: symptomName,
        date: moment(selectedAt).format('MMMM Do YYYY, h:mm a')
      });
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=symptom_report.pdf');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Font
    doc.font('Helvetica');

    // Title
    doc.fontSize(22).fillColor('#003366').text('Symptom Report', { align: 'center' });
    doc.moveDown();

    // Timestamp
    doc.fontSize(10).fillColor('gray').text(`Generated on: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`, {
      align: 'right',
    });
    doc.moveDown(1.5);

    // User Info
    doc.fontSize(12).fillColor('black');
    doc.text(`Name: ${userInfo.firstName} ${userInfo.lastName}`);
    doc.text(`Age: ${userInfo.age}`);
    doc.text(`Gender: ${userInfo.gender}`);
    doc.moveDown();

    // Symptom Breakdown
    doc.fontSize(14).fillColor('#003366').text('Symptom Breakdown:', { underline: true });
    doc.moveDown(0.5);

    Object.entries(grouped).forEach(([bodyPart, symptoms]) => {
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#003366').text(bodyPart, { underline: true });

      symptoms.forEach(({ name, date }) => {
        doc.fontSize(11).fillColor('black').text(`   • ${name}`, { continued: true });
        doc.fontSize(10).fillColor('gray').text(`  [${date}]`);
      });
    });

    doc.end();
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).send('Failed to generate PDF');
  }
});

module.exports = router;
