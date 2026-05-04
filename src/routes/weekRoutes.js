import express from "express";
import {
  getWeeks,
  createWeek,
  deleteWeek,
  clearWeek
} from "../controllers/weekController.js";

const router = express.Router();

// 📥 Listar todas as semanas
// GET /weeks (ou o prefixo que você definiu no server.js)
router.get("/", getWeeks);

// ➕ Criar uma nova semana
// POST /weeks
router.post("/", createWeek);

// 🧹 Limpar apenas as designações de uma semana (mantém o card da semana)
// POST /weeks/clear
// O Frontend envia { "weekId": 123 } no corpo da requisição
router.post("/clear", clearWeek);

// 🗑️ Excluir a semana inteira e tudo que está ligado a ela
// DELETE /weeks/:id
// O Frontend envia o ID na URL
router.delete("/:id", deleteWeek);

export default router;