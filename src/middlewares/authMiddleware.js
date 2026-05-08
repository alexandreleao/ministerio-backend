import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
    // Usando EXATAMENTE a mesma chave que definimos no login
    const SECRET = process.env.JWT_SECRET || "segredo_super";
    
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Se chegar aqui com 403, é porque o token expirou ou a chave é diferente
    return res.status(403).json({ error: "Sessão expirada ou token inválido" });
  }
};

export default authMiddleware;