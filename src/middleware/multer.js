import multer from "multer";
import createHttpError from "http-errors";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(createHttpError(400, "Only images allowed"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

// memoryStorage(): keeps uploaded file as a Buffer in req.file.buffer (as required by Cloudinary); fileFilter: rejects anything whose mimetype doest not start with image/ by calling cb(createHttpError(400, "Only images allowed")); limits.fileSize: capping uploads at 2MB (i.e. multer rejects larger files automatically )
