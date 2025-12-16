const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    image: {type: String , default: "default.png"},
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model("Info", infoSchema);