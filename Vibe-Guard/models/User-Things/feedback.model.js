const mongoose = require('mongoose');


const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 1000
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true }); 

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
