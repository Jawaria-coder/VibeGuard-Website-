const mongoose = require('mongoose');
const fs = require('fs');
const Doctor = require('./models/Doctors');
const connectDB = require('./db'); 

const rawDoctors = JSON.parse(fs.readFileSync('./data/doctors.json', 'utf-8'));


const formattedDoctors = rawDoctors.map(doc => ({
  name: doc['Name'],
  city: doc['City'],
  specialization: doc['Specialization'],
  qualification: doc['Qualification'],
  experience: doc['experience'],
  satisfactionRate: doc['satisfactionRate'],
  avgTimeToPatients: doc['avgTimeToPatients'],
  waitTime: doc['waitTime'],
  hospitalAddress: doc['hospitalAddress'],
  fee: doc['fee'],
  contact: doc['Contact'],
}));

async function importData() {
  try {
    await connectDB();
    await Doctor.deleteMany(); 
    await Doctor.insertMany(formattedDoctors);
    console.log(' Doctors Imported Successfully');
    process.exit();
  } catch (error) {
    console.error(' Error importing doctors:', error);
    process.exit(1);
  }
}

importData();