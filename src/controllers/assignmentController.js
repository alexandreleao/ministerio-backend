import prisma from "../prisma/client.js";
import { generateAssignments } from "../services/assignmentGenerator.js";

// 📋 listar
export async function getAssignments(req, res) {
  try {
    const { weekId } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: {
        weekId: Number(weekId)
      },
      include: {
        student: true,
        helper: true
      },
      orderBy: {
        id: "asc"
      }
    });

    return res.json({
      success: true,
      data: assignments
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar designações" });
  }
}

// ➕ criar manual
export async function createAssignment(req, res) {
  try {
    const { type, title, duration, studentId, helperId, weekId } = req.body;

    // 🔒 regras de negócio
    if (type === "Discurso" && helperId) {
      return res.status(400).json({
        error: "Discurso não pode ter ajudante"
      });
    }

    if (
      ["Iniciando Conversa", "Revisita", "Estudo Bíblico"].includes(type) &&
      !helperId
    ) {
      return res.status(400).json({
        error: `${type} precisa de ajudante`
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        type,
        title,
        duration,
        studentId,
        helperId: helperId || null,
        weekId
      }
    });

    return res.json(assignment);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar designação" });
  }
}

// ⚡ gerar semana
export async function generateWeek(req, res) {
  try {
    const { weekId } = req.body;

    if (!weekId) {
      return res.status(400).json({ error: "weekId é obrigatório" });
    }

    const assignments = await generateAssignments(weekId);

    return res.json(assignments);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}