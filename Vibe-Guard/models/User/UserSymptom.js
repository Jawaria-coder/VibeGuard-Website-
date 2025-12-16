// models/UserSymptom.js
const mongoose = require('mongoose');

const userSymptomSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symptomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Symptom',
    required: true,
  },
  bodyPartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BodyPart',
    required: true,
  },
  selectedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSymptom = mongoose.model('UserSymptom', userSymptomSchema);

module.exports = UserSymptom;
