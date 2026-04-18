import prisma from "../database/prisma.js";
import { success, error } from "../utils/response.js";

// 🔹 Criar estudante
export async function createStudent(req, res) {
  try {
    const { name } = req.body;

    const student = await prisma.student.create({
      data: { name }
    });

    return res.json(student);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar estudante" });
  }
}
// 🔹 Listar estudantes
export async function getStudents(req, res) {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        name: "asc"
      }
    });

    return success(res, students);

  } catch (err) {
    return error(res, err.message, 500);
  }
}