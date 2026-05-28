import { uploadImageToCloud } from '../utils/cloudinary.js';

// @desc    Upload ground image to Cloudinary cloud storage
// @route   POST /api/upload
// @access  Private (Owner/Admin)
const uploadImage = async (req, res, next) => {
  try {
    const { image } = req.body; // Expects base64 encoded data string: "data:image/jpeg;base64,..."

    if (!image) {
      return res.status(400).json({ message: 'Image base64 data payload is required' });
    }

    // Limit check for protection
    if (image.length > 8 * 1024 * 1024) {
      return res.status(400).json({ message: 'Payload size exceeds 8MB threshold.' });
    }

    const imageUrl = await uploadImageToCloud(image);

    res.json({
      success: true,
      message: 'Media uploaded successfully to cloud storage.',
      url: imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

export { uploadImage };
