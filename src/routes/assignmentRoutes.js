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

const router = express.Router();

// ✔ correto
router.get("/", getAssignments);
router.post("/", createAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);
router.post("/clear-week", clearWeek);
router.get("/stats", getStats);

// ✔ mantém separado
router.post("/generate-week", generateWeek);

export default router;