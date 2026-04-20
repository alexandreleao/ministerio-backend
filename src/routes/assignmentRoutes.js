import express from "express";

import {
  getAssignments,
  createAssignment,
  generateWeek,
  updateAssignment,
  deleteAssignment
} from "../controllers/assignmentController.js";

const router = express.Router();

// ✔ correto
router.get("/", getAssignments);
router.post("/", createAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);
// ✔ mantém separado
router.post("/generate-week", generateWeek);

export default router;