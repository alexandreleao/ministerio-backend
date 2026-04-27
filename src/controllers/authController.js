import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = "segredo_super"; // depois joga no .env

// 🔐 LOGIN
export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: "Senha inválida" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    { expiresIn: "1d" }
  );

  return res.json({ token });
}

// 🆕 REGISTER
export async function register(req, res) {
  const { name, email, password } = req.body;

  const exists = await prisma.user.findUnique({
    where: { email }
  });

  if (exists) {
    return res.status(400).json({
      error: "Email já cadastrado"
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash
    }
  });

  return res.json({
    message: "Usuário criado com sucesso"
  });
}