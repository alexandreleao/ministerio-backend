import prisma from "../database/prisma.js";
import { success, error } from "../utils/response.js";

// 🔹 Criar semana
export async function createWeek(req, res) {
  try {
    const { startDate } = req.body;

    if (!startDate) {
      return error(res, "Data inicial é obrigatória", 400);
    }

    const week = await prisma.week.create({
      data: {
        startDate: new Date(startDate)
      }
    });

    return success(res, week, 201);

  } catch (err) {
    return error(res, err.message, 500);
  }
}

// 🔹 Listar semanas
export async function getWeeks(req, res) {
  try {
    const weeks = await prisma.week.findMany({
      orderBy: {
        startDate: "desc"
      }
    });

    return success(res, weeks);

  } catch (err) {
    return error(res, err.message, 500);
  }
}