import prisma from "../database/prisma.js";
import { success, error } from "../utils/response.js";

// 🔹 Criar estudante
export async function createStudent(req, res) {
  try {
    const { name, gender } = req.body;

    if (!name || !gender) {
      return res.status(400).json({
        error: "Nome e sexo são obrigatórios"
      });
    }

    const student = await prisma.student.create({
      data: {
        name,
        gender // 🔥 ESSA LINHA RESOLVE TUDO
      }
    });

    return res.json(student);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Erro ao criar estudante"
    });
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

// 🗑️ deletar estudante
export async function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    await prisma.student.delete({
      where: { id: Number(id) }
    });

    return res.json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao excluir estudante"
    });
  }
}