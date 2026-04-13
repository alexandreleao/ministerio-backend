import prisma from "../database/prisma.js";

const assignmentTypes = [
  { type: "Iniciando Conversa", hasHelper: true, duration: 3 },
  { type: "Revisita", hasHelper: true, duration: 4 },
  { type: "Estudo Bíblico", hasHelper: true, duration: 5 },
  { type: "Discurso", hasHelper: false, duration: 5 }
];

export async function generateAssignments(weekId) {

  // 🔹 Buscar estudantes
  const students = await prisma.student.findMany({
    include: {
      assignments: true,
      helpedAssignments: true
    }
  });

  if (students.length < 2) {
    throw new Error("É necessário pelo menos 2 estudantes");
  }

  // 🔥 Calcular pontuação (menos usado = prioridade)
  const rankedStudents = students.map(student => {
    const totalAssignments =
      student.assignments.length + student.helpedAssignments.length;

    return {
      ...student,
      score: totalAssignments
    };
  });

  // 🔥 ordenar: quem tem MENOS participa primeiro
  rankedStudents.sort((a, b) => a.score - b.score);

  // 🔥 buscar última semana
  const lastWeek = await prisma.week.findFirst({
    where: {
      id: {
        lt: weekId
      }
    },
    orderBy: {
      id: "desc"
    }
  });

  let lastWeekParticipants = [];

  if (lastWeek) {
    const lastAssignments = await prisma.assignment.findMany({
      where: { weekId: lastWeek.id }
    });

    lastWeekParticipants = lastAssignments.flatMap(a => [
      a.studentId,
      a.helperId
    ]);
  }

  let assignments = [];
  let usedThisWeek = new Set();

  for (let i = 0; i < assignmentTypes.length; i++) {
    const item = assignmentTypes[i];

    // 🔹 escolher estudante priorizando quem não participou recentemente
    const student = rankedStudents.find(s =>
      !usedThisWeek.has(s.id) &&
      !lastWeekParticipants.includes(s.id)
    ) || rankedStudents.find(s => !usedThisWeek.has(s.id));

    if (!student) continue;

    usedThisWeek.add(student.id);

    let helper = null;

    if (item.hasHelper) {
      helper = rankedStudents.find(s =>
        !usedThisWeek.has(s.id) &&
        s.id !== student.id &&
        !lastWeekParticipants.includes(s.id)
      ) || rankedStudents.find(s =>
        !usedThisWeek.has(s.id) &&
        s.id !== student.id
      );

      if (helper) {
        usedThisWeek.add(helper.id);
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        type: item.type,
        title: item.type,
        duration: item.duration,
        studentId: student.id,
        helperId: helper ? helper.id : null,
        weekId
      }
    });

    assignments.push(assignment);
  }

  return assignments;
}