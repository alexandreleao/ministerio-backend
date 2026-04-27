import prisma from "./client.js";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      email: "admin@email.com",
      password: hash
    }
  });

  console.log("Usuário criado 🚀", user);
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });