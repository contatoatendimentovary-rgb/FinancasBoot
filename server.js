export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ resposta: "Método não permitido" });
  }

  const { dados } = req.body;

  const prompt = `
Você é um consultor financeiro.

Analise:
${JSON.stringify(dados)}

Responda:
- hábitos financeiros
- onde cortar gastos
- sugestão de investimento
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
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({
        resposta: "Erro da IA: " + data.error.message
      });
    }

    let texto = "Sem resposta da IA.";

    if (data.candidates) {
      const parts = data.candidates[0]?.content?.parts;
      if (parts) {
        texto = parts.map(p => p.text).join("\n");
      }
    }

    res.status(200).json({ resposta: texto });

  } catch (err) {
    res.status(200).json({
      resposta: "Erro ao conectar com IA."
    });
  }
}
