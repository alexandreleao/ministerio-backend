import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Esta chave DEVE ser idêntica à do middleware
const SECRET = process.env.JWT_SECRET || "segredo_super"; 

// 🔐 LOGIN
export async function login(req, res) {
  try {
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

    // Gerando o token com a chave SECRET
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1d" }
    );

    // Retornamos o token e o email (útil para o frontend)
    return res.json({ token, email: user.email });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao processar login" });
  }
}

// 🆕 REGISTER
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const exists = await prisma.user.findUnique({
      where: { email }
    });

    if (exists) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hash
      }
    });

    return res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}