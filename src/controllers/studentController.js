import prisma from "../database/prisma.js";
import { success, error } from "../utils/response.js";

// 🔹 Criar estudante
export async function createStudent(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return error(res, "Nome é obrigatório", 400);
    }

    const student = await prisma.student.create({
      data: { name }
    });

    return success(res, student, 201);

  } catch (err) {
    return error(res, err.message, 500);
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