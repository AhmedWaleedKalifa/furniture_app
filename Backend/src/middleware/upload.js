const multer = require('multer');

// Configure Multer to store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;