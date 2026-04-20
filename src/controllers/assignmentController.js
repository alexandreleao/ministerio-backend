import prisma from "../prisma/client.js";


// 📋 LISTAR
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
    console.error(error);
    return res.status(500).json({
      error: "Erro ao buscar designações"
    });
  }
}


// ➕ CRIAR
export async function createAssignment(req, res) {
  try {
    const { type, title, duration, studentId, helperId, weekId } = req.body;

    if (studentId === helperId) {
      return res.status(400).json({
        error: "Aluno e ajudante não podem ser iguais"
      });
    }

    const existing = await prisma.assignment.findFirst({
      where: {
        weekId,
        OR: [
          { studentId },
          { helperId: studentId }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        error: "Esse aluno já está designado nessa semana"
      });
    }

    const sameType = await prisma.assignment.findFirst({
      where: {
        weekId,
        type
      }
    });

    if (sameType) {
      return res.status(400).json({
        error: "Já existe uma designação desse tipo na semana"
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

    return res.json({
      success: true,
      data: assignment
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao criar designação"
    });
  }
}


// 📝 ATUALIZAR
export async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { type, title, duration, studentId, helperId } = req.body;

    const updated = await prisma.assignment.update({
      where: { id: Number(id) },
      data: {
        type,
        title,
        duration,
        studentId,
        helperId
      }
    });

    return res.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao atualizar designação"
    });
  }
}


// 🗑️ DELETAR
export async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;

    await prisma.assignment.delete({
      where: { id: Number(id) }
    });

    return res.json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao excluir designação"
    });
  }
}


// 📊 STATS
export async function getStats(req, res) {
  try {
    const { weekId } = req.query;

    const where = {};

    if (weekId) {
      where.weekId = Number(weekId);
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        student: true,
        helper: true
      }
    });

    const stats = {
      totalAssignments: assignments.length,
      byStudent: {},
      byType: {}
    };

    for (const a of assignments) {
      stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;

      if (a.student) {
        stats.byStudent[a.student.name] =
          (stats.byStudent[a.student.name] || 0) + 1;
      }

      if (a.helper) {
        stats.byStudent[a.helper.name] =
          (stats.byStudent[a.helper.name] || 0) + 1;
      }
    }

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao gerar estatísticas"
    });
  }
}


// 🎲 GERAR SEMANA (VERSÃO ESTÁVEL)
export async function generateWeek(req, res) {
  try {
    const { weekId } = req.body;

    if (!weekId) {
      return res.status(400).json({
        error: "weekId é obrigatório"
      });
    }

    await prisma.assignment.deleteMany({
      where: { weekId }
    });

    const students = await prisma.student.findMany();

    if (students.length < 2) {
      return res.status(400).json({
        error: "Cadastre pelo menos 2 estudantes"
      });
    }

    // 📊 histórico
    const history = await prisma.assignment.findMany({
      take: 100,
      orderBy: { id: "desc" }
    });

    // 🧠 contagem de participação (com peso)
    const participation = {};

    for (const a of history) {
      const weight = a.type === "Discurso" ? 2 : 1;

      participation[a.studentId] =
        (participation[a.studentId] || 0) + weight;

      if (a.helperId) {
        participation[a.helperId] =
          (participation[a.helperId] || 0) + 1;
      }
    }

    // 🚫 evitar repetição da semana passada
    const lastWeek = await prisma.week.findFirst({
      where: { id: { lt: weekId } },
      orderBy: { id: "desc" }
    });

    const lastWeekIds = new Set();

    if (lastWeek) {
      const lastAssignments = await prisma.assignment.findMany({
        where: { weekId: lastWeek.id }
      });

      for (const a of lastAssignments) {
        lastWeekIds.add(a.studentId);
        if (a.helperId) lastWeekIds.add(a.helperId);
      }
    }

    // 🚫 histórico de duplas
    const pairHistory = new Set();

    for (const a of history) {
      if (a.helperId) {
        pairHistory.add(`${a.studentId}-${a.helperId}`);
        pairHistory.add(`${a.helperId}-${a.studentId}`);
      }
    }

    // 🧠 ordenação inteligente
    const sorted = [...students].sort((a, b) => {
      const pa = participation[a.id] || 0;
      const pb = participation[b.id] || 0;

      const penaltyA = lastWeekIds.has(a.id) ? 100 : 0;
      const penaltyB = lastWeekIds.has(b.id) ? 100 : 0;

      return (pa + penaltyA) - (pb + penaltyB);
    });

    const used = new Set();

    function nextStudent() {
      return sorted.find(s => !used.has(s.id));
    }

    function findHelper(student) {
      // tenta evitar dupla repetida
      const candidate = sorted.find(s => {
        if (used.has(s.id)) return false;

        const pairKey = `${student.id}-${s.id}`;
        return !pairHistory.has(pairKey);
      });

      return candidate || nextStudent();
    }

    const types = [
      { type: "Iniciando Conversa", duration: 5 },
      { type: "Revisita", duration: 5 },
      { type: "Estudo Bíblico", duration: 6 },
      { type: "Discurso", duration: 5 }
    ];

    const assignments = [];

    for (const t of types) {
      const student = nextStudent();
      if (!student) break;

      used.add(student.id);

      let helper = null;

      if (t.type !== "Discurso") {
        helper = findHelper(student);
        if (!helper) break;

        used.add(helper.id);
      }

      assignments.push({
        type: t.type,
        title: t.type,
        duration: t.duration,
        studentId: student.id,
        helperId: helper ? helper.id : null,
        weekId
      });
    }

    await prisma.assignment.createMany({
      data: assignments
    });

    return res.json({
      success: true,
      data: assignments
    });

  } catch (error) {
    console.error("ERRO NÍVEL 2:", error);

    return res.status(500).json({
      error: "Erro ao gerar escala inteligente"
    });
  }
}