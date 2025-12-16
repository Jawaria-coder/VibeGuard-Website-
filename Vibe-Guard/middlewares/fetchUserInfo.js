const jwt = require("jsonwebtoken");
const userModel = require("../models/User/user.model");
const Info = require("../models/User-Things/BasicInfo");

module.exports = async function fetchUserInfo(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.locals.user = null;
      res.locals.info = null;
      return next();
    }

    const decoded = jwt.verify(token, "shhhh");
    const user = await userModel.findById(decoded._id);
    const info = await Info.findOne({ userId: decoded._id });

    res.locals.user = user;
    res.locals.info = info || {
      firstName: "Not Provided",
      lastName: "",
      age: "N/A",
      gender: "N/A",
      image: "default.png"
    };

    next();
  } catch (err) {
    console.error("Sidebar info middleware error:", err);
    res.locals.user = null;
    res.locals.info = null;
    next();
  }
};