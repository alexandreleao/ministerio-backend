import { Router } from "express";
import { 
  getAssignments, 
  createAssignment, 
  updateAssignment, 
  deleteAssignment,
  updateStatus, 
  getStats, 
  generateWeek, 
  clearWeek 
} from "../controllers/assignmentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// A rota de stats precisa do authMiddleware para não dar 403
router.get("/stats", authMiddleware, getStats);

router.get("/", authMiddleware, getAssignments);
router.post("/", authMiddleware, createAssignment);
router.put("/:id", authMiddleware, updateAssignment);
router.delete("/:id", authMiddleware, deleteAssignment);
router.patch("/:id/status", authMiddleware, updateStatus);
router.post("/generate-week", authMiddleware, generateWeek);
router.delete("/week/:id", authMiddleware, clearWeek);

export default router;