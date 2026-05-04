import prisma from "../prisma/client.js";

/**
 * 📥 LISTAR SEMANAS
 */
export async function getWeeks(req, res) {
  try {
    const weeks = await prisma.week.findMany({
      orderBy: {
        startDate: "desc"
      }
    });

    return res.json({
      data: weeks
    });
  } catch (err) {
    console.error("❌ Erro ao buscar semanas:", err);
    return res.status(500).json({ error: "Erro ao buscar semanas" });
  }
}

/**
 * ➕ CRIAR NOVA SEMANA
 */
export async function createWeek(req, res) {
  try {
    const week = await prisma.week.create({
      data: {
        startDate: new Date()
      }
    });

    return res.status(201).json({
      data: week
    });
  } catch (err) {
    console.error("❌ Erro ao criar semana:", err);
    return res.status(500).json({ error: "Erro ao criar semana" });
  }
}

/**
 * 🗑️ EXCLUIR SEMANA (E SUAS DESIGNAÇÕES)
 * Rota esperada: DELETE /weeks/:id
 */
export async function deleteWeek(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID da semana é obrigatório na URL" });
  }

  try {
    const weekId = Number(id);

    // Usamos uma transação para garantir que ou deleta tudo ou nada
    await prisma.$transaction([
      // 1. Remove as designações primeiro (filhos)
      prisma.assignment.deleteMany({
        where: { weekId: weekId }
      }),
      // 2. Remove a semana depois (pai)
      prisma.week.delete({
        where: { id: weekId }
      })
    ]);

    return res.json({ message: "Semana e designações excluídas com sucesso" });
  } catch (err) {
    console.error("❌ Erro ao excluir semana:", err);
    return res.status(500).json({ error: "Erro ao excluir semana no banco de dados" });
  }
}

/**
 * 🧹 LIMPAR DESIGNAÇÕES DE UMA SEMANA
 * Rota esperada: POST /weeks/clear
 */
export async function clearWeek(req, res) {
  // Pegamos o weekId do corpo da requisição (body)
  const { weekId } = req.body;

  if (!weekId) {
    return res.status(400).json({ error: "weekId é obrigatório no corpo da requisição" });
  }

  try {
    const result = await prisma.assignment.deleteMany({
      where: {
        weekId: Number(weekId)
      }
    });

    return res.json({
      message: "Designações removidas com sucesso",
      count: result.count
    });
  } catch (err) {
    console.error("❌ Erro ao limpar designações:", err);
    return res.status(500).json({ error: "Erro ao limpar designações" });
  }
}