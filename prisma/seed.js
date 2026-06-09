require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("tacto123", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "admin@tacto.com.br" },
    update: {},
    create: {
      email: "admin@tacto.com.br",
      name: "Administrador",
      passwordHash,
    },
  });

  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
