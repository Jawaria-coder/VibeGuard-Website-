const express = require("express");
const router = express.Router();
const upload = require("../../config/multerconfig");
const  authenticateUser = require('../../middlewares/localuser-middleware');
const userModel = require("../../models/User/user.model");
const Info = require("../../models/User-Things/BasicInfo");
const HealthData = require("../../models/User-Things/health.model");



router.get("/api/getUserData", authenticateUser, async (req, res) => {
    
    const userId = req.user._id; 
    try {
        const userInfo = await Info.findOne({ userId });

        if (!userInfo) {
            return res.status(404).json({ message: "No user data found." });
        }

        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// Save or update user data for a specific user
router.post("/api/saveUserData", authenticateUser, upload.single("image"), async (req, res) => {
    const userId = req.user._id;
    let image = req.file ? req.file.filename : "default.png";
    const { firstName, lastName, age, gender } = req.body;

    // Convert age to a number
    const numericAge = parseInt(age, 10);

    try {
        // Validate input
        if (!firstName || !lastName || !age || !gender) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        if (isNaN(numericAge) || numericAge < 16) {
            return res.status(400).json({ success: false, message: "Age must be a number greater than 0." });
        }

        const userInfo = await Info.findOneAndUpdate(
            { userId },
            {
                firstName,
                lastName,
                age: numericAge, // store validated numeric age
                gender,
                image
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, message: "User data saved successfully.", data: userInfo });
    } catch (error) {
        console.error("Error saving user data:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});


router.get("/input", authenticateUser,(req, res) => {
    res.render("UserDashboard/input", { userId: req.user._id, layout:false });
});

router.get("/api/getHealthData", authenticateUser, async (req, res) => {
    const userId = req.user._id;
    try {
        const healthData = await HealthData.find({ userId }).sort({ time: -1 });

        if (!healthData.length) {
            return res.status(404).json({ message: "No health data found." });
        }

        res.json(healthData);
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});
router.post("/api/addHealthData", authenticateUser, async (req, res) => {
    const userId = req.user._id;
    const { time, weight, bp, heartRate, bmi } = req.body;

    try {
        const newHealthData = new HealthData({ 
            userId, 
            time, 
            weight, 
            bp, 
            heartRate: heartRate ? parseInt(heartRate) : undefined,
            bmi: bmi ? parseFloat(bmi) : undefined
        });

        await newHealthData.save();

        res.status(200).json({ message: "Health data added successfully." });
    } catch (error) {
        console.error("Error adding health data:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});
router.get("/dashboard", authenticateUser, async (req, res) => {
    const userId = req.user._id;

    const userInfo = await Info.findOne({ userId });
    if (!userInfo) {
        return res.redirect("/tracking/input");
    }


    const notifications = [
        "🎯 Like the User Dashboard? Don’t forget to give feedback!",
        "💡 Tip: Keep your health data updated for better insights.",
    ];

    res.render("UserDashboard/dashboard", {
        layout: false,
        notifications,
    });
});


module.exports = router;