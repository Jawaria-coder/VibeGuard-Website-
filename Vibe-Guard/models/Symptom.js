const mongoose = require('mongoose');

const SymptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  body_part_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BodyPart', required: true },
}, { timestamps: true });  

module.exports = mongoose.model('Symptom', SymptomSchema);
