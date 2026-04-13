import express from "express";
import prisma from "../database/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { startDate } = req.body;

  const week = await prisma.week.create({
    data: {
      startDate: new Date(startDate)
    }
  });

  res.json(week);
});

export default router;