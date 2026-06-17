import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando importação de questões do ENEM...");
  
  const filePath = path.join(__dirname, "enem_2023_sample.json");
  if (!fs.existsSync(filePath)) {
    console.error("Arquivo JSON não encontrado:", filePath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  let count = 0;

  for (const item of data) {
    // 1. Create the question
    await prisma.question.create({
      data: {
        type: "multiple_choice",
        body: item.question,
        baseText: item.baseText || null,
        discipline: item.topic || item.discipline,
        tags: JSON.stringify(item.tags || []),
        yearLevel: `ENEM ${item.year}`,
        difficulty: "medium", // mock
        source: "public",
        imageUrl: item.imageUrl || null,
        options: {
          create: item.options.map((opt: any) => ({
            label: opt.label,
            text: opt.text,
            isCorrect: opt.isCorrect,
          }))
        }
      }
    });
    count++;
  }

  console.log(`✅ Importação concluída! ${count} questões inseridas no Acervo Público.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
