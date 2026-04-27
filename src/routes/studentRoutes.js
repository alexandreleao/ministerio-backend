import express from "express";
import {
  getStudents,
  createStudent,
  deleteStudent
} from "../controllers/studentController.js";

// ✅ IMPORT CORRETO
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// 🔐 ROTAS PROTEGIDAS
router.get("/", authMiddleware, getStudents);
router.post("/", authMiddleware, createStudent);
router.delete("/:id", authMiddleware, deleteStudent);

export default router;