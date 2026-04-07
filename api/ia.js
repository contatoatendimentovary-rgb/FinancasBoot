export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ resposta: "Método não permitido" });
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Dê uma dica financeira simples." }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.candidates) {
      return res.status(200).json({
        resposta: "Erro real da API: " + JSON.stringify(data)
      });
    }

    const texto = data.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: texto });

  } catch (err) {
    res.status(200).json({
      resposta: "Erro ao conectar API"
    });
  }
}
