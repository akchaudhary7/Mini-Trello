import {Router} from 'express'
import authenticate from '../middlewares/auth.middleware.js'

const router = Router();

router.get("/test", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You accessed a protected route!",
    user: req.user,
  });
});

export default router;