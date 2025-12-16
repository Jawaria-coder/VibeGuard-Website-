const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  dose: String,
  symptomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Symptom' }
}, { timestamps: true }); 

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
