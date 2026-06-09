const { PrismaClient } = require("@prisma/client");
const https = require("https");
const readline = require("readline");

const prisma = new PrismaClient();

const DATASETS = [
  { year: "2022", url: "https://huggingface.co/datasets/maritaca-ai/enem/raw/main/2022.jsonl" },
  { year: "2023", url: "https://huggingface.co/datasets/maritaca-ai/enem/raw/main/2023.jsonl" },
  { year: "2024", url: "https://huggingface.co/datasets/maritaca-ai/enem/raw/main/2024.jsonl" },
];

function classifyDiscipline(text) {
  const t = text.toLowerCase();
  
  if (t.includes("equação") || t.includes("matemática") || t.includes("geometria") || t.includes("gráfico") || t.includes("porcentagem") || t.includes("cálculo") || t.includes("probabilidade")) {
    return "Matemática";
  }
  if (t.includes("física") || t.includes("velocidade") || t.includes("energia") || t.includes("movimento") || t.includes("calor") || t.includes("gravidade") || t.includes("circuito")) {
    return "Física";
  }
  if (t.includes("química") || t.includes("átomo") || t.includes("reação") || t.includes("molécula") || t.includes("ph ") || t.includes("solução") || t.includes("químico")) {
    return "Química";
  }
  if (t.includes("célula") || t.includes("biologia") || t.includes("dna") || t.includes("genética") || t.includes("organismo") || t.includes("espécie") || t.includes("proteína") || t.includes("vírus") || t.includes("bactéria")) {
    return "Biologia";
  }
  if (t.includes("poema") || t.includes("texto") || t.includes("literatura") || t.includes("linguagem") || t.includes("autor") || t.includes("gênero") || t.includes("leitor")) {
    return "Português";
  }
  if (t.includes("história") || t.includes("século") || t.includes("império") || t.includes("revolução") || t.includes("guerra") || t.includes("democracia") || t.includes("escravidão") || t.includes("período")) {
    return "História";
  }
  if (t.includes("geografia") || t.includes("clima") || t.includes("mapa") || t.includes("população") || t.includes("região") || t.includes("floresta") || t.includes("continente")) {
    return "Geografia";
  }
  
  return "Estudos Gerais";
}

function fetchJsonl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: Status Code ${res.statusCode}`));
        return;
      }

      const lines = [];
      const rl = readline.createInterface({
        input: res,
        crlfDelay: Infinity
      });

      rl.on("line", (line) => {
        if (line.trim()) {
          try {
            lines.push(JSON.parse(line));
          } catch (e) {
            console.error("Failed to parse JSON line:", e.message);
          }
        }
      });

      rl.on("close", () => {
        resolve(lines);
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log("Limpando questões públicas anteriores...");
  const deleteResult = await prisma.question.deleteMany({
    where: { source: "public" }
  });
  console.log(`Removidas ${deleteResult.count} questões antigas.`);

  for (const ds of DATASETS) {
    console.log(`Baixando dataset do ENEM ${ds.year}...`);
    try {
      const questions = await fetchJsonl(ds.url);
      console.log(`Baixado com sucesso! Processando ${questions.length} questões...`);

      let importedCount = 0;
      for (const q of questions) {
        // Formatar corpo da questão e tratar figuras
        let body = q.question || "";
        const figures = q.figures || [];
        const descriptions = q.description || [];

        // Substituir [[placeholder]] pelas imagens e descrições correspondentes
        figures.forEach((figUrl, idx) => {
          const desc = descriptions[idx] ? `\n\n*(Descrição da Imagem: ${descriptions[idx]})*` : "";
          const imgMarkdown = `\n\n![Imagem da Questão](${figUrl})${desc}\n\n`;
          
          if (body.includes("[[placeholder]]")) {
            body = body.replace("[[placeholder]]", imgMarkdown);
          } else {
            body += imgMarkdown;
          }
        });

        // Heurística de disciplina
        const discipline = classifyDiscipline(body);
        
        // Mapear opções e identificar a correta
        const alternatives = q.alternatives || [];
        const correctLetter = q.label || "A"; // Gabarito original do ENEM (ex: "A", "B", "C"...)
        const letters = ["A", "B", "C", "D", "E"];

        const options = alternatives.map((text, idx) => {
          const letter = letters[idx] || "A";
          return {
            label: letter,
            text: text,
            isCorrect: letter === correctLetter
          };
        });

        const tags = ["ENEM", `ENEM ${ds.year}`];

        await prisma.question.create({
          data: {
            id: `maritaca-${ds.year}-${q.id}`,
            type: "multiple_choice",
            body: body,
            discipline: discipline,
            yearLevel: "Ensino Médio",
            difficulty: "medium",
            bnccCode: null,
            source: "public",
            tags: JSON.stringify(tags),
            userId: null,
            options: {
              create: options
            }
          }
        });
        importedCount++;
      }
      console.log(`Importadas ${importedCount} questões do ENEM ${ds.year}.`);
    } catch (err) {
      console.error(`Erro ao importar ENEM ${ds.year}:`, err.message);
    }
  }

  console.log("Seeding do acervo Maritaca concluído!");
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
