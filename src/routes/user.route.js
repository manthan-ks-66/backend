import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/user.controllers.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  // middleware: jaate jaate mujhse milte jana
  // middleware to upload the file (specifies what fields need to be uploaded)
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  // function to be performed on this route
  registerUser
);

// login user:
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
