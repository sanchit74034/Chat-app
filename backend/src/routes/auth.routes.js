import express from 'express';
import {login, logout, signup, changepassword,updateProfilePic, checkauth} from '../controllers/auth.controller.js';
import { protectedRoute } from '../middleware/protectedRoute.js';
import {upload } from '../middleware/multer.js'

const router = express.Router();

router.post('/signup',signup);

router.post('/login',login);

router.post('/logout',logout);

router.put("/update-profile-pic", protectedRoute, upload.single("image"), updateProfilePic);

router.post('/changepassword',protectedRoute,changepassword);

router.get('/checkauth',protectedRoute,checkauth)

export default router;