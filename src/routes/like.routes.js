import { Router } from "express";
import { getLikedVideos, toggleLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/:targetId").post(toggleLike);
router.route("/videos").get(getLikedVideos);

export default router;
