import express from "express";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getStats,
  generateWeek,
  clearWeek
} from "../controllers/assignmentController.js";

// ✅ CORRETO
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// 🔐 ROTAS PROTEGIDAS
router.get("/", authMiddleware, getAssignments);
router.post("/", authMiddleware, createAssignment);
router.put("/:id", authMiddleware, updateAssignment);
router.delete("/:id", authMiddleware, deleteAssignment);
router.get("/stats", authMiddleware, getStats);
router.post("/clear-week", authMiddleware, clearWeek);
router.post("/generate-week", authMiddleware, generateWeek);

export default router;