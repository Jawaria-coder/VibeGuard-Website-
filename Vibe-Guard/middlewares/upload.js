const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images'); 
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, bytes) {
      if (err) return cb(err);
      const filename = bytes.toString("hex") + path.extname(file.originalname);
      cb(null, filename); 
    });
  }
});

const upload = multer({ storage });

module.exports = upload;