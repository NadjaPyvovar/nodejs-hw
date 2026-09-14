import createHttpError from "http-errors";

import { User } from "../models/user.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "No file");
  }

  const result = await saveFileToCloudinary(req.file.buffer, req.user._id);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true },
  );

  res.status(200).json({ url: user.avatar });
};

// req.file: populated by upload.single("avatar") middleware (if missing, the filed was not send or was rejected by fileFilter => 400 No file); result.secure_url: Cloudinary HTTPS URL for uploaded img (get saved on the user docs); { new: true }: tells findByIdAndUpdate to return the doc after the update 
