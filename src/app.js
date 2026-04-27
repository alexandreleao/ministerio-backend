import express from "express";
import cors from "cors";

// ROTAS
import studentRoutes from "./routes/studentRoutes.js";
import weekRoutes from "./routes/weekRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import generateRoutes from "./routes/generateRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// MIDDLEWARES
import { authMiddleware } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

/**
 * 🔧 CONFIG GLOBAL
 */
app.use(cors());
app.use(express.json());

/**
 * 🔓 ROTAS PÚBLICAS (SEM TOKEN)
 */
app.use("/auth", authRoutes);

/**
 * 🔐 ROTAS PROTEGIDAS (COM TOKEN)
 */
app.use("/students", authMiddleware, studentRoutes);
app.use("/weeks", authMiddleware, weekRoutes);
app.use("/assignments", authMiddleware, assignmentRoutes);
app.use("/generate-week", authMiddleware, generateRoutes);

/**
 * 🏠 ROTA BASE (TESTE)
 */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API rodando 🚀"
  });
});

/**
 * 🚫 ROTA NÃO ENCONTRADA (boa prática)
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada"
  });
});

/**
 * ⚠️ ERROR HANDLER (SEMPRE POR ÚLTIMO)
 */
app.use(errorHandler);

/**
 * 🚀 START SERVER
 */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});