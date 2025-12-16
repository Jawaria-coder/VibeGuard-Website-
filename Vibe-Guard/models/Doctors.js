const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  city: { type: String, required: true }, 
  specialization: { type: String, required: true }, 
  qualification: { type: String }, 
  experience: { type: Number },
  satisfactionRate: { type: Number }, 
  avgTimeToPatients: { type: Number }, 
  waitTime: { type: Number }, 
  hospitalAddress: { type: String }, 
  fee: { type: Number }, 
  contact: { type: String },
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;