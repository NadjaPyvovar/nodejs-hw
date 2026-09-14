import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { upload } from "../middleware/multer.js";
import { updateUserAvatar } from "../controllers/userController.js";

const router = Router();

router.patch(
  "/users/me/avatar",
  authenticate,
  upload.single("avatar"),
  updateUserAvatar,
);

export default router;

// upload.single("avatar"): tells multer to expect one file under the form filed name "avatar", part the multipart/form-data body and populate req.file + req.body prior to updateUserAVatar runs 
