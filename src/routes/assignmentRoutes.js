import express from "express";
import { createAssignment } from "../controllers/assignmentController.js";

const router = express.Router();

router.post("/", createAssignment);

export default router;