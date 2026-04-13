import prisma from "../database/prisma.js";

// 🔹 Criar estudante
export async function createStudent(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Nome é obrigatório"
      });
    }

    const student = await prisma.student.create({
      data: { name }
    });

    return res.status(201).json(student);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// 🔹 Listar estudantes
export async function getStudents(req, res) {
  try {
    const students = await prisma.student.findMany();

    return res.json(students);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}