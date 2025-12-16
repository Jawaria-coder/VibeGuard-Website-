const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login/register?message=Please+log+in+first");
    }

    const decoded = jwt.verify(token, "shhhh");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Middleware error:", err);
    return res.redirect("/login/register?message=Please+log+in+first");
  }
};
