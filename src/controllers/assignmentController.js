import prisma from "../database/prisma.js";

// 🔹 Criar designação
export async function createAssignment(req, res) {
  try {
    const { type, title, duration, studentId, helperId, weekId } = req.body;

    if (type === "Discurso" && helperId) {
      return res.status(400).json({
        error: "Discurso não pode ter ajudante"
      });
    }

    if (studentId === helperId) {
      return res.status(400).json({
        error: "Estudante não pode ser ajudante de si mesmo"
      });
    }

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
    return res.status(500).json({ error: error.message });
  }
}