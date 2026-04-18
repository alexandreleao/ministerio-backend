import express from "express";
import {
  getAssignments,
  createAssignment,
  generateWeek
} from "../controllers/assignmentController.js";

const router = express.Router();

// ✔ correto
router.get("/", getAssignments);
router.post("/", createAssignment);

// ✔ mantém separado
router.post("/generate-week", generateWeek);

export default router;