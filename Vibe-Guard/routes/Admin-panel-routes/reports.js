const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const User = require('../../models/User/user.model');
const BodyPart = require('../../models/BodyPart');
const Medicine = require('../../models/Medicine');
const Symptom = require('../../models/Symptom');
const SymptomDetail = require('../../models/SymptomDetail');
const Feedback = require("../../models/User-Things/feedback.model");
const isAuthenticated = require('../../middlewares/admin-middleware');

router.get('/report/download',isAuthenticated, async (req, res) => {
  try {
    const [
      totalBodyParts,
      totalSymptoms,
      totalMedicines,
      totalSymptomDetails,
      totalUsers,
      totalSuspendedUsers,
      totalAdmins,
      totalFeedbacks,
      allUsers
    ] = await Promise.all([
      BodyPart.countDocuments(),
      Symptom.countDocuments(),
      Medicine.countDocuments(),
      SymptomDetail.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ suspended: true }),
      User.countDocuments({ role: 'admin' }),
      Feedback.countDocuments(),
      User.find({}, 'username createdAt lastLogin').lean()
    ]);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=summary_report.pdf');

    doc.pipe(res);

    // Title
    doc
      .font('Helvetica-Bold')
      .fontSize(28)
      .text('Summary Report', { align: 'center' })
      .moveDown(1);

    doc
      .fillColor('blue')
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('General Statistics', { underline: true });
    doc.fillColor('black');
    doc.moveDown(0.7);

    // Simple bullet list for stats
    const stats = [
      { label: 'Total Body Parts', value: totalBodyParts },
      { label: 'Total Symptoms', value: totalSymptoms },
      { label: 'Total Medicines', value: totalMedicines },
      { label: 'Total Symptom Details', value: totalSymptomDetails },
      { label: 'Total Users', value: totalUsers },
      { label: 'Suspended Users', value: totalSuspendedUsers },
      { label: 'Admins', value: totalAdmins },
      { label: 'Total Feedbacks', value: totalFeedbacks },
    ];

    stats.forEach(({ label, value }) => {
      doc
        .font('Helvetica')
        .fontSize(14)
        .text(`• ${label}: `, { continued: true })
        .font('Helvetica-Bold')
        .text(value.toString());
    });

    doc.moveDown(2);

    doc
      .fillColor('blue')
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('User Registration and Last Login Info', { underline: true });
    doc.fillColor('black');
    doc.moveDown(0.7);

    // For each user, print nicely indented info:
    allUsers.forEach(user => {
      const regDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(user.username);

      doc
        .font('Helvetica')
        .fontSize(12)
        .text(`Registered On: ${regDate}`, { indent: 20 });
      doc.text(`Last Login: ${lastLogin}`, { indent: 20 });

      doc.moveDown(0.8);

      if (doc.y > doc.page.height - doc.page.margins.bottom - 50) {
        doc.addPage();
      }
    });

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF.');
  }
});

module.exports = router;
