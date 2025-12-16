const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        // Use environment variable for MongoDB URI
        const connectionString = process.env.MONGO_URI;
        if (!connectionString) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectdb;