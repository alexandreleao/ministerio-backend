import prisma from "../database/prisma.js";

// 🔹 Criar semana
export async function createWeek(req, res) {
  try {
    const { startDate } = req.body;

    if (!startDate) {
      return res.status(400).json({
        error: "Data inicial é obrigatória"
      });
    }

    const week = await prisma.week.create({
      data: {
        startDate: new Date(startDate)
      }
    });

    return res.status(201).json(week);

  } catch (error) {
    return res.status(500).json({ error: error.message });
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

    return res.json(weeks);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}