import { Router } from "express";
import healthRouter from "./health.route.js";
import studioRouter from "./studio.route.js";

const router = Router();

router.use(healthRouter);
router.use(studioRouter);

export default router;
