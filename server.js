import express from "express";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/api/ia", async (req, res) => {
  const { dados } = req.body;

  const prompt = `
Você é um consultor financeiro profissional.

Analise os dados:
${JSON.stringify(dados)}

Responda em português, de forma clara:

- Hábitos financeiros
- Onde cortar gastos
- Sugestão de investimento
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

    console.log("RESPOSTA COMPLETA:", JSON.stringify(data, null, 2));

    // 🔥 EXTRAÇÃO FLEXÍVEL (resolve o problema)
    let texto = "⚠️ Não foi possível interpretar a resposta da IA.";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content?.parts;

      if (parts && parts.length > 0) {
        texto = parts.map(p => p.text).join("\n");
      }
    }

    res.json({ resposta: texto });

  } catch (err) {
    console.log("ERRO:", err);
    res.json({ resposta: "❌ Erro ao conectar com IA." });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
