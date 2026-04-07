import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/ia", async (req, res) => {
  const { dados } = req.body;

  const prompt = `
Você é um consultor financeiro profissional.

Analise os dados:
${JSON.stringify(dados)}

Responda de forma clara:
1. Como estão os hábitos financeiros
2. Onde cortar gastos
3. Sugestão de investimento
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer SUA_API_KEY_AQUI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    res.json({ resposta: data.choices[0].message.content });

  } catch (err) {
    res.json({ resposta: "Erro ao conectar com IA" });
  }
});

app.listen(3000, () => console.log("Servidor rodando"));
