import { Router } from "express";
import healthRouter from "./health.route";
import studioRouter from "./studio.route";

const router = Router();

router.use(healthRouter);
router.use(studioRouter);

export default router;
