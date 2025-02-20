import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment } from "../controllers/comments.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/comments/:videoId/add-comment").post(addComment);

export default router;
