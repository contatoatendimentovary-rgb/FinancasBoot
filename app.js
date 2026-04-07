let dados = JSON.parse(localStorage.getItem("dados")) || [];

function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
}

function interpretar(texto) {
  texto = texto.toLowerCase();

  let valor = texto.match(/\d+/);
  valor = valor ? parseFloat(valor[0]) : 0;

  let tipo = "despesa";

  if (texto.includes("recebi") || texto.includes("salario")) {
    tipo = "receita";
  }

  return { valor, tipo, texto };
}

function processar() {
  const input = document.getElementById("texto");
  const texto = input.value;

  if (!texto) return;

  dados.push(interpretar(texto));
  salvar();

  input.value = "";
  render();
}

function render() {
  let receita = 0;
  let despesa = 0;

  const listaR = document.getElementById("listaReceitas");
  const listaD = document.getElementById("listaDespesas");

  listaR.innerHTML = "";
  listaD.innerHTML = "";

  dados.forEach(d => {
    if (d.tipo === "receita") {
      receita += d.valor;
      listaR.innerHTML += `<div>+ ${d.valor} - ${d.texto}</div>`;
    } else {
      despesa += d.valor;
      listaD.innerHTML += `<div>- ${d.valor} - ${d.texto}</div>`;
    }
  });

  const saldo = receita - despesa;

  document.getElementById("receita").innerText = receita;
  document.getElementById("despesa").innerText = despesa;
  document.getElementById("saldo").innerText = saldo;

  desenharGrafico(receita, despesa);
}

function desenharGrafico(receita, despesa) {
  const ctx = document.getElementById("grafico");

  if (window.chart) {
    window.chart.destroy();
  }

  window.chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Receita", "Despesa"],
      datasets: [{
        data: [receita, despesa]
      }]
    }
  });
}

window.onload = render;
