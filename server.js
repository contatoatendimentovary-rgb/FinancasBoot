import express from "express";

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Rota da IA
app.post("/api/ia", async (req, res) => {
  const { dados } = req.body;

  const prompt = `
Você é um consultor financeiro profissional.

Analise os dados abaixo:
${JSON.stringify(dados)}

Responda de forma clara e organizada:

1. Como estão os hábitos financeiros
2. Onde cortar gastos
3. Sugestão de investimento
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("RESPOSTA GEMINI:", JSON.stringify(data, null, 2));

    // Validação forte (evita erro 500)
    if (
      !data ||
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      return res.json({
        resposta: "⚠️ A IA não conseguiu analisar os dados. Tente novamente."
      });
    }

    const texto = data.candidates[0].content.parts[0].text;

    res.json({ resposta: texto });

  } catch (err) {
    console.log("ERRO IA:", err);

    res.json({
      resposta: "❌ Erro ao conectar com IA. Verifique sua API ou tente novamente."
    });
  }
});

// Servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
