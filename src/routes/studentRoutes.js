import express from "express";
import prisma from "../database/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name } = req.body;

  const student = await prisma.student.create({
    data: { name }
  });

  res.json(student);
});

router.get("/", async (req, res) => {
  const students = await prisma.student.findMany();
  res.json(students);
});

export default router;