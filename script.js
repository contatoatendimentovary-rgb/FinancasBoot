// 🎯 Funções principais do app

let grafico;

// Exibir mês atual
function mesAtual(){
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    let hoje = new Date();
    return meses[hoje.getMonth()] + "/" + hoje.getFullYear();
}
document.getElementById("mesAtual").innerText = mesAtual();

// Trocar aba Resumo / Extrato
function trocarTab(tab){
    document.getElementById('resumoTab').style.display = tab === 'resumo' ? 'block':'none';
    document.getElementById('extratoTab').style.display = tab === 'extrato' ? 'block':'none';

    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    event.target.classList.add('active');
}

// Interpretar texto do input
function interpretarTexto(texto){
    texto = texto.toLowerCase();
    let valor = parseFloat(texto.match(/\d+/));
    let tipo = "despesa";

    if(texto.includes("ganhei") || texto.includes("recebi") || texto.includes("salario") || texto.includes("salário")){
        tipo = "receita";
    }

    let categoria = "Outros";
    if(texto.includes("mercado") || texto.includes("comida")) categoria = "Alimentação";
    else if(texto.includes("uber") || texto.includes("gasolina")) categoria = "Transporte";
    else if(texto.includes("cinema")) categoria = "Lazer";

    return { valor, tipo, categoria, descricao:texto };
}

// Adicionar lançamento
async function adicionar(){
    let texto = document.getElementById('texto').value;
    if(!texto) return;

    let dados = interpretarTexto(texto);

    await fetch('/add',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(dados)
    });

    document.getElementById('texto').value = "";
    carregar();
}

// Deletar lançamento
async function deletar(id){
    await fetch('/delete/'+id,{method:'DELETE'});
    carregar();
}

// Carregar dados e atualizar interface
async function carregar(){
    let res = await fetch('/dados');
    let dados = await res.json();

    let receita = 0;
    let despesa = 0;
    let categorias = {};

    let lista = document.getElementById('lista');
    lista.innerHTML = "";

    dados.forEach(d=>{
        if(d.tipo === "receita") receita += d.valor;
        else despesa += d.valor;

        if(!categorias[d.categoria]) categorias[d.categoria] = 0;
        categorias[d.categoria] += d.valor;

        lista.innerHTML += `
        <div class="item">
            <span>${d.descricao}</span>
            <span class="${d.tipo}">
                ${d.valor}
                <span class="delete" onclick="deletar(${d.id})">❌</span>
            </span>
        </div>`;
    });

    document.getElementById('receita').innerText = receita;
    document.getElementById('despesa').innerText = despesa;
    document.getElementById('saldo').innerText = receita - despesa;

    atualizarGrafico(categorias);
    gerarIA(receita, despesa, categorias);
}

// Atualizar gráfico
function atualizarGrafico(categorias){
    if(grafico) grafico.destroy();

    grafico = new Chart(document.getElementById('grafico'),{
        type:'pie',
        data:{
            labels:Object.keys(categorias),
            datasets:[{ data:Object.values(categorias), backgroundColor:['#2e7d32','#c62828','#f9a825','#1565c0','#6a1b9a'] }]
        }
    });
}

// Gerar análise da IA (simulada)
function gerarIA(receita, despesa, categorias){
    let maior = Object.keys(categorias).reduce((a,b)=> categorias[a]>categorias[b]?a:b, "Outros");

    let texto = despesa > receita ? `⚠️ Você está gastando mais do que ganha.` : `✅ Seu saldo está positivo.`;
    texto += ` Maior gasto: ${maior}.`;

    document.getElementById('iaResumo').innerText = "🤖 " + texto;
}

// Inicializa
carregar();
