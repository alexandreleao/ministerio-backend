import prisma from "../prisma/client.js";

// 📋 LISTAR
export async function getAssignments(req, res) {
  try {
    const { weekId } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: { weekId: Number(weekId) },
      include: {
        student: true,
        helper: true
      },
      orderBy: { id: "asc" }
    });

    return res.json({ success: true, data: assignments });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar designações" });
  }
}

// ➕ CRIAR
export async function createAssignment(req, res) {
  try {
    const { type, title, duration, studentId, helperId, weekId } = req.body;

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (type === "Discurso" && student.gender !== "M") {
      return res.status(400).json({
        error: "Apenas homens podem fazer discurso"
      });
    }

    if (studentId === helperId) {
      return res.status(400).json({
        error: "Aluno e ajudante não podem ser iguais"
      });
    }

    const existing = await prisma.assignment.findFirst({
      where: {
        weekId,
        OR: [{ studentId }, { helperId: studentId }]
      }
    });

    if (existing) {
      return res.status(400).json({
        error: "Esse aluno já está designado nessa semana"
      });
    }

    const sameType = await prisma.assignment.findFirst({
      where: { weekId, type }
    });

    if (sameType) {
      return res.status(400).json({
        error: "Já existe essa designação na semana"
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

    return res.json({ success: true, data: assignment });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar designação" });
  }
}

// ✏️ ATUALIZAR
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

    return res.json({ success: true, data: updated });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao atualizar designação"
    });
  }
}

// ❌ EXCLUIR
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

    const assignments = await prisma.assignment.findMany({
      where: weekId ? { weekId: Number(weekId) } : {},
      include: {
        student: true,
        helper: true
      }
    });

    const stats = {
      totalAssignments: assignments.length,
      byStudent: {},
      byType: {},
      declined: 0,
      encouragement: 0,
      declineReasons: {}
    };

    for (const a of assignments) {
      // tipos
      stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;

      // alunos
      if (a.student) {
        stats.byStudent[a.student.name] =
          (stats.byStudent[a.student.name] || 0) + 1;
      }

      if (a.helper) {
        stats.byStudent[a.helper.name] =
          (stats.byStudent[a.helper.name] || 0) + 1;
      }

      // recusas
      if (a.declined) {
        stats.declined++;

        if (a.declineReason) {
          stats.declineReasons[a.declineReason] =
            (stats.declineReasons[a.declineReason] || 0) + 1;
        }
      }

      // encorajamento
      if (a.needsEncouragement) {
        stats.encouragement++;
      }
    }

    return res.json({ success: true, data: stats });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao gerar estatísticas"
    });
  }
}

// 🎲 GERAR SEMANA
export async function generateWeek(req, res) {
  try {
    const { weekId } = req.body;

    if (!weekId) {
      return res.status(400).json({ error: "weekId obrigatório" });
    }

    const week = await prisma.week.findUnique({
      where: { id: weekId }
    });

    await prisma.assignment.deleteMany({
      where: { weekId }
    });

    const students = await prisma.student.findMany();

    const history = await prisma.assignment.findMany({
      take: 100,
      orderBy: { id: "desc" }
    });

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

    const sorted = [...students].sort((a, b) => {
      return (participation[a.id] || 0) - (participation[b.id] || 0);
    });

    const used = new Set();

    function nextStudentByType(type) {
      return sorted.find(s => {
        if (used.has(s.id)) return false;
        if (type === "Discurso" && s.gender !== "M") return false;
        return true;
      });
    }

    function nextStudent() {
      return sorted.find(s => !used.has(s.id));
    }

    const types = [
      { type: "Iniciando Conversa", duration: 5 },
      { type: "Revisita", duration: 5 },
      { type: "Estudo Bíblico", duration: 6 }
    ];

    if (week?.hasDemonstration) {
      types.push({ type: "Demonstração", duration: 5 });
    }

    types.push({ type: "Discurso", duration: 5 });

    const assignments = [];

    for (const t of types) {
      const student = nextStudentByType(t.type);
      if (!student) break;

      used.add(student.id);

      let helper = null;

      if (t.type !== "Discurso") {
        helper = nextStudent();
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

    await prisma.assignment.createMany({ data: assignments });

    return res.json({ success: true, data: assignments });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao gerar semana"
    });
  }
}

// 🧹 LIMPAR
export async function clearWeek(req, res) {
  try {
    const { weekId } = req.body;

    await prisma.assignment.deleteMany({
      where: { weekId }
    });

    return res.json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao limpar semana"
    });
  }
}