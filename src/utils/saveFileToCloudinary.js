import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveFileToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        public_id: `user-${userId}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

// note: cloudinary.config(...): runs once at module load, wiring up account credential from .env; uploadStream.end(buffer): writes the whole in-memory buffer to the stream and closes it; public_id:\user-${userId}` +  overwrite: true: i.e. each user always overwrites his own previous avatar at the same Cloudinary path, instead of accumulating a new img on every upload 
