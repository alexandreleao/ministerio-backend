import express from "express";
import { generateAssignments } from "../services/assignmentGenerator.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { weekId } = req.body;

    const result = await generateAssignments(weekId);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;