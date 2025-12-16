const mongoose = require('mongoose');

const BodyPartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: "default.png" },
},
 { timestamps: true }); 
 

module.exports = mongoose.model('BodyPart', BodyPartSchema);
