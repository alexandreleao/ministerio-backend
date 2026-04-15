import express from "express";
import studentRoutes from "./routes/studentRoutes.js";
import weekRoutes from "./routes/weekRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import generateRoutes from "./routes/generateRoutes.js";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
const app = express();

app.use(express.json());

// 🔥 REGISTRAR ROTAS
app.use("/students", studentRoutes);
app.use("/weeks", weekRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/generate-week", generateRoutes);
app.use(cors());
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});