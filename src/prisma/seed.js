import prisma from "../src/database/prisma.js";

async function main() {
  console.log("🌱 Criando dados iniciais...");

  // 👤 estudantes
  const joao = await prisma.student.create({
    data: { name: "João" }
  });

  const maria = await prisma.student.create({
    data: { name: "Maria" }
  });

  // 📅 semana
  const week = await prisma.week.create({
    data: {
      startDate: new Date("2026-05-20")
    }
  });

  console.log("✅ Seed finalizado!");
  console.log({ joao, maria, week });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });