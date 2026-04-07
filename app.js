async function analisarIA() {
  const res = await fetch("/api/ia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ dados })
  });

  const data = await res.json();

  document.getElementById("respostaIA").innerText = data.resposta;
}
