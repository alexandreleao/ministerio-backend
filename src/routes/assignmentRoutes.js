import express from "express";
import prisma from "../database/prisma.js";

const router = express.Router();

// ✅ Criar designação
router.post("/", async (req, res) => {
  try {
    const { type, title, duration, studentId, helperId, weekId } = req.body;

    // 🔥 REGRA 1: tipo "Discurso" não pode ter ajudante
    if (type === "Discurso" && helperId) {
      return res.status(400).json({
        error: "Discurso não pode ter ajudante"
      });
    }

    // 🔥 REGRA 2: não pode ser ajudante de si mesmo
    if (studentId === helperId) {
      return res.status(400).json({
        error: "Estudante não pode ser ajudante de si mesmo"
      });
    }

    // 🔥 REGRA 3: não repetir estudante na mesma semana
    const existing = await prisma.assignment.findFirst({
      where: {
        weekId,
        OR: [
          { studentId },
          { helperId: studentId },
          { studentId: helperId }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        error: "Estudante já possui designação nesta semana"
      });
    }

    // ✅ Criar designação
    const assignment = await prisma.assignment.create({
      data: {
        type,
        title,
        duration,
        studentId,
        helperId,
        weekId
      }
    });

    return res.status(201).json(assignment);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

// ✅ Listar designações por semana
router.get("/", async (req, res) => {
  try {
    const { weekId } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: {
        weekId: Number(weekId)
      },
      include: {
        student: true,
        helper: true
      }
    });

    return res.json(assignments);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

export default router;