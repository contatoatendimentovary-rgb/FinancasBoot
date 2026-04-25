let chart;

// Controle de Abas
function abrirAba(event, nomeAba) {
    document.querySelectorAll('.aba-content').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(nomeAba).classList.add('active');
    event.currentTarget.classList.add('active');
    if(nomeAba === 'extrato' || nomeAba === 'saude') carregar();
}

// Enviar para a IA
async function enviarGasto() {
    const input = document.getElementById("inputGasto");
    const status = document.getElementById("iaStatus");
    const msg = input.value;
    if (!msg) return;

    status.innerText = "🤖 Processando transação...";
    
    try {
        const res = await fetch("/api/server", { // Rota da sua API no server.js
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: msg })
        });
        
        const resultado = await res.json();
        
        // Salvando no seu backend (endpoint /add que você já possui)
        await fetch("/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...resultado, data: new Date() })
        });

        status.innerText = "✅ Adicionado com sucesso!";
        input.value = "";
        setTimeout(() => { abrirAba({currentTarget: document.querySelector('.tab-btn')}, 'extrato') }, 1000);

    } catch (e) {
        status.innerText = "❌ Erro ao processar.";
    }
}

async function carregar() {
    const res = await fetch("/dados");
    const dados = await res.json();

    let totalReceita = 0, totalDespesa = 0;
    let categorias = { "Essencial": 0, "Lazer": 0, "Investimento": 0, "Outros": 0 };

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    dados.forEach(d => {
        if(d.tipo === "receita") totalReceita += d.valor;
        else {
            totalDespesa += d.valor;
            categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valor;
        }

        lista.innerHTML += `
            <div class="item">
                <span>${d.descricao} <small style="color:#94a3b8">(${d.categoria})</small></span>
                <span class="${d.tipo}">${d.tipo === 'receita' ? '+' : '-'} R$ ${d.valor.toFixed(2)}</span>
            </div>`;
    });

    document.getElementById("receita").innerText = `R$ ${totalReceita.toFixed(2)}`;
    document.getElementById("despesa").innerText = `R$ ${totalDespesa.toFixed(2)}`;
    document.getElementById("saldo").innerText = `R$ ${(totalReceita - totalDespesa).toFixed(2)}`;

    atualizarGrafico(categorias);
    atualizarSaude(totalReceita, categorias);
}

function atualizarGrafico(cats) {
    const ctx = document.getElementById('grafico').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(cats),
            datasets: [{ data: Object.values(cats), backgroundColor: ['#3b82f6', '#a855f7', '#22c55e', '#64748b'] }]
        },
        options: { plugins: { legend: { labels: { color: 'white' } } } }
    });
}

function atualizarSaude(receita, cats) {
    const metas = { fixo: receita * 0.5, lazer: receita * 0.3, invest: receita * 0.2 };
    
    configBarra("bar-fixo", "txt-fixo", cats["Essencial"] || 0, metas.fixo);
    configBarra("bar-lazer", "txt-lazer", cats["Lazer"] || 0, metas.lazer);
    configBarra("bar-invest", "txt-invest", cats["Investimento"] || 0, metas.invest);

    document.getElementById("iaResumo").innerHTML = `🤖 <b>Dica PRO:</b> ${receita > 0 ? 'Você tem R$ ' + metas.invest.toFixed(2) + ' recomendados para investir este mês.' : 'Aguardando receitas.'}`;
}

function configBarra(idBar, idTxt, atual, meta) {
    const porc = Math.min((atual / meta) * 100, 100) || 0;
    document.getElementById(idBar).style.width = porc + "%";
    document.getElementById(idTxt).innerText = `R$ ${atual.toFixed(2)} / R$ ${meta.toFixed(2)}`;
}

carregar();
