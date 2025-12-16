const mongoose = require('mongoose');
const fs = require('fs');
const Symptom = require('./models/Symptom'); 
const connectDB = require('./db'); 


const rawSymptoms = JSON.parse(fs.readFileSync('./data/symptom.json', 'utf-8'));

async function importSymptoms() {
  try {
    await connectDB();
    
    
    await Symptom.deleteMany();
    
    
    await Symptom.insertMany(rawSymptoms);
    
    console.log('✅ Symptoms imported successfully.');
    process.exit();
  } catch (error) {
    console.error('❌ Error importing symptoms:', error);
    process.exit(1);
  }
}

importSymptoms();
