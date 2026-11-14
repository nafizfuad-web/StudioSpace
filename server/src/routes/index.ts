import { Router } from "express";
import healthRouter from "./health.route.js";
import studioRouter from "./studio.route.js";
import userRouter from "./user.route.js";
import bookingRouter from "./booking.route.js";
import wishlistRouter from "./wishlist.route.js";

const router = Router();

router.use(healthRouter);
router.use(studioRouter);
router.use(userRouter);
router.use(bookingRouter);
router.use(wishlistRouter);

export default router;
