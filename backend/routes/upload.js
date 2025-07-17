const express = require('express');
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

module.exports = router;