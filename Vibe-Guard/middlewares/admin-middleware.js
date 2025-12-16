const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    const token = req.cookies?.token; 
    if (!token) {
      return res.redirect("/login/register"); 
    }

    // Decode the token
    const decoded = jwt.verify(token, "shhhh");
    if (decoded.role !== "admin") {
      return res.status(403).send("Access Denied: Only admins can access this page.");
    }

    req.user = decoded; 
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error.message);
    res.redirect("/login/register");
  }
};
