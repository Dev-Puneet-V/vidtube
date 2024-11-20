import { Router } from "express";
import {
  getLikedContent,
  toggleLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/:targetId").post(toggleLike);
router.route("/").get(getLikedContent);

export default router;
