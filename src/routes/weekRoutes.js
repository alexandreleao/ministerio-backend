import express from "express";
import {
  createWeek,
  getWeeks
} from "../controllers/weekController.js";

const router = express.Router();

router.post("/", createWeek);
router.get("/", getWeeks);

export default router;