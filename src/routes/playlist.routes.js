import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;

//
// private : 673ea8c6cc8330670798447c user: 67369c258becb9b8a0a908ab
// public : 673ebe0c1d72d2e2003d8f1a user: 67369c258becb9b8a0a908ab
// public : 673ebf08d24d57eebd45e9f4 user: 67369cb88becb9b8a0a908af
// private : 673ebf5e5b56ff5685b21b5f user: 67369cb88becb9b8a0a908af
