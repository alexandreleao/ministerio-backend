import jwt from "jsonwebtoken";

const SECRET = "segredo_super"; // ⚠️ tem que ser o mesmo do login

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  // 🔥 separa "Bearer TOKEN"
  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    return next();

  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}