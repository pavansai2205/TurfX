import { v2 as cloudinary } from 'cloudinary';

const hasCloudinaryKeys = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryKeys && process.env.CLOUDINARY_CLOUD_NAME !== 'cloudinary_cloud_name') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary SDK configured successfully.');
} else {
  console.log('⚠️ Cloudinary keys not set. Running in simulation/mock upload mode.');
}

// Upload base64 helper
const uploadImageToCloud = async (base64Str) => {
  if (hasCloudinaryKeys && process.env.CLOUDINARY_CLOUD_NAME !== 'cloudinary_cloud_name') {
    try {
      const uploadResponse = await cloudinary.uploader.upload(base64Str, {
        upload_preset: undefined, // Uses default settings or standard folders
        folder: 'turfx_pitches',
      });
      return uploadResponse.secure_url;
    } catch (err) {
      console.error('Cloudinary API upload error:', err.message);
      throw new Error(`Cloudinary upload failed: ${err.message}`);
    }
  }

  // FALLBACK SIMULATION: If no keys are set, we return a high-quality Unsplash sports image placeholder
  console.log('💡 Cloudinary upload simulated. Returning high-quality sports placeholder.');
  const sportsPlaceholders = [
    'https://images.unsplash.com/photo-1540747737956-37872ce3f862?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
  ];
  return sportsPlaceholders[Math.floor(Math.random() * sportsPlaceholders.length)];
};

export { uploadImageToCloud };
