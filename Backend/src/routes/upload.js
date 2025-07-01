const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const { verifyToken, getUserProfile } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', verifyToken, getUserProfile, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const bucket = getStorage().bucket();
    const fileName = `images/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, message: 'Upload failed' });
    });

    stream.on('finish', async () => {
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      res.status(200).json({
        success: true,
        data: { url: publicUrl }
      });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
