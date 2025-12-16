const express = require("express");
const expressLayout = require("express-ejs-layouts");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(expressLayout);
app.use(cookieParser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Routes
const homeRoutes = require("./routes/Admin-panel-routes/homeRoutes");
const bodyPartRoutes = require("./routes/Admin-panel-routes/bodyPartRoutes");
const symptomRoutes = require("./routes/Admin-panel-routes/symptomRoutes");
const symptomDetailRoutes = require("./routes/Admin-panel-routes/symptomDetailRoutes");
const medicineRoutes = require("./routes/Admin-panel-routes/medicine.routes");
const doctorRoutes = require("./routes/Admin-panel-routes/doctorsRoutes");
const symptomchecker = require("./routes/SymptomsChecker.routes");
const loginRoutes = require("./routes/userRoutes/user.routes");
const UserDashboard = require("./routes/User-DashBoard-routes/userdb.routes");
const isAuthenticated = require("./middlewares/localuser-middleware");
const feedback = require("./routes/User-DashBoard-routes/feedback");
const report = require("./routes/Admin-panel-routes/reports");
const doctorListRoutes = require("./routes/doctorListRoutes");
const aboutUsRoutes = require("./routes/about");
const userReportRoutes = require("./routes/User-DashBoard-routes/user-report");

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/admin", homeRoutes);
app.use("/bodyparts", bodyPartRoutes);
app.use("/symptoms", symptomRoutes);
app.use("/symptomDetails", symptomDetailRoutes);
app.use("/medicine", medicineRoutes);
app.use("/doctor", doctorRoutes);
app.use("/login", loginRoutes);
app.use("/symptomschecker", symptomchecker);
app.use("/tracking", UserDashboard);
app.use("/feedback", feedback);
app.use("/reports", report);
app.use("/doctor-list", doctorListRoutes);
app.use("/about-Us", aboutUsRoutes);
app.use("/user-report", userReportRoutes);

const verifyUser = require("./middlewares/verifyuser");

app.get("/", verifyUser, (req, res) => {
  const user = req.user;

  const notifications =
    user && user.role !== "admin"
      ? [
          "🎉 Welcome to Vibe Guard! Take something healthful today!",
          "💬 Try our User Dashboard to post stories and chat with the chatbot!",
        ]
      : [];

  res.render("MainPage", {
    layout: false,
    user,
    notifications,
  });
});

app.get("/testimonials", (req, res) => {
  res.render("UserDashboard/displayfeeback", { layout: false });
});

app.get("/user", (req, res) => {
  res.render("UserDashboard/userstories.ejs", { layout: false });
});

app.get("/find-doctors", (req, res) => {
  res.redirect("/doctor-list");
});

// Database Connection
const connectdb = require("./db");

// Use Render’s port or fallback to 5000 for local
const Port = process.env.PORT || 5000;

const start = async () => {
  await connectdb();
  app.listen(Port, () => {
    console.log(`Server started at port ${Port}`);
  });
};

start();
