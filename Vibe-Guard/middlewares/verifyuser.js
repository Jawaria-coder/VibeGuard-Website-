const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null; 
    return next();
  }

  try {
    const decoded = jwt.verify(token, "shhhh");
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    req.user = null;
    next(); 
  }
};
