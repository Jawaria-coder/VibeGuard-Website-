const mongoose = require('mongoose');

const SymptomDetailSchema = new mongoose.Schema({
  overview: { type: String, required: true },
  possibleCauses: { type: [String], required: true },
  precautions: { type: [String], required: true },
  remedies: { type: [String], required: true },
  fact: { type: [String], required: false },
  lifestyleTips: { type: [String], required: true },
  symptom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Symptom', required: true },
}, { timestamps: true });  

module.exports = mongoose.model('SymptomDetail', SymptomDetailSchema);
