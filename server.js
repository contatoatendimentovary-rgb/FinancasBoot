import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/ia", async (req, res) => {
  const { dados } = req.body;

  const prompt = `
Você é um consultor financeiro.

Analise os dados:
${JSON.stringify(dados)}

Responda:
- Como estão os hábitos financeiros
- Onde cortar gastos
- Sugestão de investimento
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Erro ao analisar com IA.";

    res.json({ resposta: texto });

  } catch (err) {
    res.json({ resposta: "Erro ao conectar com IA." });
  }
});

app.listen(3000, () => console.log("Servidor rodando"));
