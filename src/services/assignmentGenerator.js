import prisma from "../prisma/client.js";

export async function generateAssignments(weekId) {
  let students = await prisma.student.findMany({
    orderBy: { id: "asc" }
  });

  if (students.length < 2) {
    throw new Error("É necessário pelo menos 2 alunos");
  }

  const types = [
    { type: "Iniciando Conversa", duration: 3, requiresHelper: true },
    { type: "Revisita", duration: 4, requiresHelper: true },
    { type: "Estudo Bíblico", duration: 5, requiresHelper: true },
    { type: "Discurso", duration: 5, requiresHelper: false }
  ];

  const assignments = [];

  for (const item of types) {
    const student = students.shift();
    if (!student) continue;

    let helper = null;

    if (item.requiresHelper) {
      helper = students.shift();
      if (!helper) continue;
    }

    const assignment = await prisma.assignment.create({
      data: {
        type: item.type,
        title: item.type,
        duration: item.duration,
        studentId: student.id,
        helperId: helper ? helper.id : null,
        weekId
      },
      include: {
        student: true,
        helper: true
      }
    });

    assignments.push(assignment);
  }

  return assignments;
}