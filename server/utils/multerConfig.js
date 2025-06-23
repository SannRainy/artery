const multer = require('multer');
const path = require('path');

// Setup storage untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // simpan ke folder 'uploads/'
  },
  filename: (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error('File originalname is missing'));
    }
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;
