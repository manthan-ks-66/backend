import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addComment,
  deleteComment,
  updateComment,
  getVideoComments,
  getUserAllComments,
} from "../controllers/comment.controllers.js";

const router = Router();

// middleware
router.use(upload.none());
router.use(verifyJWT);

router.route("/:videoId/add-comment").post(addComment);

router.route("/:commentId/update-comment").patch(updateComment);

router.route("/:videoId/get-all-comments").post(getVideoComments);

// TODO: postman testing of delete and get user comment
router.route("/get-user-comments").get(getUserAllComments);

router.route("/:commentId/delete-user-comment").delete(deleteComment);

export default router;
