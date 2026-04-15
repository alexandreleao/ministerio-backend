import prisma from "../database/prisma.js";
import { success, error } from "../utils/response.js";

// 🔹 Criar designação
export async function createAssignment(req, res) {
  try {
    const { type, title, duration, studentId, helperId, weekId } = req.body;

    // 🔥 validações básicas
    if (!type || !title || !duration || !studentId || !weekId) {
      return error(res, "Dados obrigatórios não informados", 400);
    }

    if (type === "Discurso" && helperId) {
      return error(res, "Discurso não pode ter ajudante", 400);
    }

    if (studentId === helperId) {
      return error(res, "Estudante não pode ser ajudante de si mesmo", 400);
    }

    // 🔍 verificar se estudante já tem designação na semana
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
      return error(res, "Estudante já possui designação nesta semana", 400);
    }

    // 🔍 verificar se student existe
    const studentExists = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!studentExists) {
      return error(res, "Estudante não encontrado", 404);
    }

    // 🔍 verificar helper (se existir)
    if (helperId) {
      const helperExists = await prisma.student.findUnique({
        where: { id: helperId }
      });

      if (!helperExists) {
        return error(res, "Ajudante não encontrado", 404);
      }
    }

    // 🔍 verificar semana
    const weekExists = await prisma.week.findUnique({
      where: { id: weekId }
    });

    if (!weekExists) {
      return error(res, "Semana não encontrada", 404);
    }

    // 🔥 criar designação
    const assignment = await prisma.assignment.create({
      data: {
        type,
        title,
        duration,
        studentId,
        helperId: helperId || null,
        weekId
      },
      include: {
        student: true,
        helper: true,
        week: true
      }
    });

    return success(res, assignment, 201);

  } catch (err) {
    return error(res, err.message, 500);
  }
}

// 🔹 Listar designações por semana
export async function getAssignments(req, res) {
  try {
    const { weekId } = req.query;

    if (!weekId) {
      return error(res, "weekId é obrigatório", 400);
    }

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

    return success(res, assignments);

  } catch (err) {
    return error(res, err.message, 500);
  }
}