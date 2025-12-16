const mongoose = require('mongoose');

const healthSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    time: { type: Date, required: true },
    weight: { type: Number, required: true },
    bp: { type: String, required: true },
    heartRate: { type: Number },
    bmi: { type: Number }        
});

module.exports = mongoose.model('HealthData', healthSchema);