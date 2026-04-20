import prisma from "../database/prisma.js";
import { success, error } from "../utils/response.js";

// 🧠 pega segunda-feira da semana atual
function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();

  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return monday;
}

// 🔹 Criar semana
export async function createWeek(req, res) {
  try {
    // 🔥 pega última semana
    const lastWeek = await prisma.week.findFirst({
      orderBy: { startDate: "desc" }
    });

    let startDate;

    if (!lastWeek) {
      // primeira semana
      startDate = getStartOfWeek();
    } else {
      // próxima semana
      const next = new Date(lastWeek.startDate);
      next.setDate(next.getDate() + 7);
      startDate = next;
    }

    // 🔥 PROTEÇÃO EXTRA (evita duplicar mesmo assim)
    const existing = await prisma.week.findFirst({
      where: { startDate }
    });

    if (existing) {
      return res.json(existing);
    }

    const week = await prisma.week.create({
      data: { startDate }
    });

    return res.json(week);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// 🔹 Listar semanas (mantém igual)
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

