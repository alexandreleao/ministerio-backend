import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 📊 1. ESTATÍSTICAS (DASHBOARD)

export const getStats = async (req, res) => {
  try {
    const [total, encouragementCount] = await Promise.all([
      prisma.assignment.count(),
      prisma.assignment.count({ where: { needsEncouragement: true } })
    ]);

    // Usando apenas os campos que o log de erro confirmou como disponíveis
    const allData = await prisma.assignment.findMany({
      select: {
        declined: true, 
        type: true,
        declineReason: true
      }
    });

    const stats = {
      totalAssignments: total,
      declined: allData.filter(a => a.declined === true).length,
      encouragement: encouragementCount,
      byType: {},
      declineReasons: {},
      byStudent: {} 
    };

    allData.forEach(item => {
      if (item.type) {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      }
      // Se declined for true, contamos como recusa
      if (item.declined && item.declineReason) {
        stats.declineReasons[item.declineReason] = (stats.declineReasons[item.declineReason] || 0) + 1;
      }
    });

    res.json({ data: stats });
  } catch (error) {
    console.error("❌ ERRO NO BACKEND:", error);
    res.status(500).json({ error: "Erro interno", details: error.message });
  }
};
// ... suas outras funções (createAssignment, updateAssignment, etc) permanecem abaixo

// 📝 2. CRUD BÁSICO
export const getAssignments = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({ include: { student: true, helper: true, week: true } });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar designações" });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const newAssignment = await prisma.assignment.create({ data: { ...req.body, status: 'pendente' } });
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar designação" });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const updated = await prisma.assignment.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar" });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    await prisma.assignment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir" });
  }
};

// 🔄 3. STATUS E ATUALIZAÇÕES RÁPIDAS
// src/controllers/assignmentController.js



// 📅 4. FUNÇÕES DE SEMANA (O QUE ESTAVA FALTANDO)
export const clearWeek = async (req, res) => {
  try {
    await prisma.assignment.deleteMany({ where: { weekId: parseInt(req.params.id) } });
    res.json({ message: "Semana limpa" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao limpar semana" });
  }
};

export const generateWeek = async (req, res) => {
  // Lógica básica para não quebrar o import
  try {
    res.json({ message: "Função generateWeek chamada (Lógica de automação pendente)" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar semana" });
  }
};

// Adicione esta função ao final do seu assignmentController.js

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, declineReason } = req.body;

  try {
    // Validar se o status enviado é um dos permitidos
    const validStatus = ['PENDING', 'COMPLETED', 'DECLINED'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const updated = await prisma.assignment.update({
      where: { id: Number(id) },
      data: { 
        status: status,
        // Se for uma recusa, salva o motivo. Se não, limpa o campo.
        declineReason: status === 'DECLINED' ? declineReason : null
      }
    });

    res.json({ 
      success: true, 
      message: "Status atualizado com sucesso",
      data: updated 
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ error: "Erro interno ao atualizar status" });
  }
};