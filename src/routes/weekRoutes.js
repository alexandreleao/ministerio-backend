import express from "express";
import {
  getWeeks,
  createWeek
} from "../controllers/weekController.js";

// ✅ CORRETO
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// 🔐 ROTAS PROTEGIDAS
router.get("/", authMiddleware, getWeeks);
router.post("/", authMiddleware, createWeek);

export default router;