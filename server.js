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

Responda em português de forma clara:

- Como estão os hábitos financeiros
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

    // 🔥 LOG COMPLETO PRA DEBUG
    console.log("RESPOSTA GEMINI:", JSON.stringify(data, null, 2));

    // 🔴 MOSTRAR ERRO REAL DA API
    if (data.error) {
      return res.json({
        resposta: "❌ Erro da API: " + data.error.message
      });
    }

    // 🔥 EXTRAÇÃO FLEXÍVEL
    let texto = "⚠️ IA sem resposta.";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0]?.content?.parts;

      if (parts && parts.length > 0) {
        texto = parts.map(p => p.text).join("\n");
      }
    }

    res.json({ resposta: texto });

  } catch (err) {
    console.log("ERRO GERAL:", err);

    res.json({
      resposta: "❌ Erro ao conectar com IA."
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
