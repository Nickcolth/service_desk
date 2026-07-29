import './styles.css';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api';
const app = document.querySelector('#app');
const toastEl = document.querySelector('#toast');
const state = { page: 'dashboard', selectedPrepId: 'prep-1', prepTab: 'dados', selectedAssetId: 'NOTEGEO659', assetDirty: false, assetDraft: null };

const data = {
  preparacoes: [
    { id: 'prep-1', tipo: 'Admissão', candidato: 'Candidato Teste 001', empresa: 'Atmis Gestão', maquina: 'NOTEGESTAO024', notebookAntigo: '', status: 'Finalizado RH', envio: null, etapas: {}, checklist: {} },
    { id: 'prep-2', tipo: 'Troca', candidato: 'Colaborador Teste 002', empresa: 'GEO', maquina: 'NOTEGEO659', notebookAntigo: 'NOTEGEO410', status: 'Preparando Máquina', envio: true, etapas: {}, checklist: {} }
  ],
  ativos: [
    { id: 'NOTEGEO659', nome: 'NOTEGEO659', status: 'Operacional', empresa: 'GEO', fabricante: 'Dell', modelo: 'Latitude 3550', serial: 'SERIALTESTE001', patrimonio: 'PAT001', usuario: 'Colaborador Teste 002' },
    { id: 'NOTEKAFFA031', nome: 'NOTEKAFFA031', status: 'Estoque', empresa: 'Kaffa', fabricante: 'Dell', modelo: 'Vostro 3520', serial: 'SERIALTESTE002', patrimonio: 'PAT002', usuario: '-' }
  ],
  chamados: [
    { numero: 'CH000101', titulo: 'Falha no Outlook', fila: 'Service Desk', status: 'Novo', solicitante: 'Pessoa Teste 001', sla: 'Expira em 45 min' },
    { numero: 'CH000102', titulo: 'Recolhimento de notebook', fila: 'Recolhimento', status: 'Em atendimento', solicitante: 'Pessoa Teste 002', sla: 'OK' },
    { numero: 'CH000103', titulo: 'Aquisição de notebook', fila: 'Aquisição', status: 'Novo', solicitante: 'Pessoa Teste 003', sla: 'Expirado' }
  ]
};

const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
const today = () => new Date().toLocaleDateString('pt-BR');
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(() => toastEl.classList.remove('show'), 2500); }
function shell(body){
  return `<div class="layout"><header class="top"><div class="brand"><span class="brand-icon">S</span><span>Service Desk</span></div></header><aside class="side">${nav('dashboard','⌂','Início')}${nav('preparacoes','▣','Preparação')}${nav('chamados','☰','Chamados')}${nav('ativos','▤','Ativos')}</aside><section class="main">${body}</section></div>`;
}
function nav(page, icon, label){ return `<button class="nav ${state.page===page?'active':''}" data-nav="${page}"><span>${icon}</span><span>${label}</span></button>`; }
function setPage(page){ state.page = page; state.assetDirty = false; state.assetDraft = null; render(); }
function bindNav(){ document.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => setPage(b.dataset.nav)); }

function dashboard(){
  const aberto = data.chamados.filter(c => c.status !== 'Fechado').length;
  return shell(`<div class="page-head"><div><h1>Visão geral</h1><p class="muted">Base separada em front-end e back-end para evoluir o sistema real.</p></div></div><div class="grid kpis"><div class="card kpi">Preparações<b>${data.preparacoes.length}</b></div><div class="card kpi">Chamados abertos<b>${aberto}</b></div><div class="card kpi">Ativos<b>${data.ativos.length}</b></div><div class="card kpi">Checklist via API<b>Pronto</b></div></div><div class="card"><h2>Arquitetura</h2><p>O front consulta a API. A API consulta banco, providers Znuny/Service Up e gera arquivos, como o checklist baseado no modelo original.</p></div>`);
}

function preparacoes(){
  const rows = data.preparacoes.map(p => `<tr class="row" data-prep="${p.id}"><td>${esc(p.candidato)}</td><td>${esc(p.tipo)}</td><td>${esc(p.empresa)}</td><td>${esc(p.maquina)}</td><td><span class="badge warn">${esc(p.status)}</span></td></tr>`).join('');
  return shell(`<div class="page-head"><div><h1>Preparação de Máquina</h1><p class="muted">Clique na linha para abrir o fluxo completo.</p></div><button class="btn">+ Nova</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Colaborador</th><th>Tipo</th><th>Empresa</th><th>Máquina</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}
function selectedPrep(){ return data.preparacoes.find(p => p.id === state.selectedPrepId) || data.preparacoes[0]; }
function prepDetail(){
  const p = selectedPrep(); const f = p.etapas;
  const tab = state.prepTab;
  const tabs = ['dados','funcoes','checklist'].map(t => `<button class="tab ${tab===t?'active':''}" data-tab="${t}">${t}</button>`).join('');
  let content = '';
  if(tab === 'dados') content = `<div class="card"><div class="form"><label>Colaborador<input value="${esc(p.candidato)}"></label><label>Máquina preparada<input value="${esc(p.maquina)}"></label><label>Notebook antigo<input value="${esc(p.notebookAntigo || '-')}"></label><label>Empresa<input value="${esc(p.empresa)}"></label></div></div>`;
  if(tab === 'funcoes') content = funcoesPrep(p, f);
  if(tab === 'checklist') content = checklistPrep(p);
  return shell(`<div class="page-head"><div><h1>Preparação - ${esc(p.candidato)}</h1><p class="muted">${esc(p.tipo)} • ${esc(p.maquina)}</p></div><button class="btn secondary" data-back-prep>Voltar</button></div><div class="tabs">${tabs}</div>${content}`);
}
function funcoesPrep(p, f){
  const isTroca = p.tipo === 'Troca';
  const steps = [
    ['expedicao','Nota de Expedição', p.envio === true],
    ['envio','Chamado de Envio', p.envio === true && f.expedicao],
    ['recolhimento','Recolhimento', isTroca && (p.envio === false || f.envio)],
    ['comodato','Comodato', (p.envio ? f.envio : p.envio === false) && (!isTroca || f.recolhimento)],
    ['checklist','Checklist', f.comodato]
  ];
  return `<div class="card"><h2>Fluxo de envio</h2><div class="actions"><button class="btn ${p.envio===true?'green':''}" data-envio="true">Será enviado</button><button class="btn secondary ${p.envio===false?'green':''}" data-envio="false">Não será enviado</button></div><div class="steps" style="margin-top:16px">${steps.map(([k,t,on]) => `<button class="step ${f[k]?'done':''}" data-step="${k}" ${on?'':'disabled'}>${t}<br><small>${f[k]?'Concluído':'Pendente'}</small></button>`).join('')}</div><div class="status-list"><div class="card">Expedição<br><b>${f.expedicao?'OK':'-'}</b></div><div class="card">Envio<br><b>${f.envio?'OK':'-'}</b></div><div class="card">Recolhimento<br><b>${f.recolhimento?'OK':'-'}</b></div><div class="card">Comodato<br><b>${f.comodato?'OK':'-'}</b></div></div></div>`;
}
function checklistPrep(p){
  const script = p.checklist.script === 'ok'; const manual = p.checklist.manual === true;
  const itens = [
    ['Formatar notebook / Instalar Windows','OK'], ['Criar usuário Imagem','OK'], ['Nomear máquina','OK'], ['Ingressar no domínio','OK'], ['Configurar ADM local','OK'], ['Logon com usuário de rede','OK'],
    ['Executar script Instalação Automatizada', script ? 'OK automático' : manual ? 'N/A' : 'Pendente'],
    ['Instaladores individuais cobertos pelo script', script ? 'N/A' : manual ? 'OK manual' : 'Pendente'],
    ['Abrir chamado NF de saída', p.etapas.expedicao ? 'OK' : p.envio === false ? 'N/A' : 'Pendente'],
    ['Atualizar inventário no sistema de ativos', p.checklist.inventario ? 'OK automático' : 'Pendente'],
    ['Solicitar termo Docusign F-TI-02', p.etapas.comodato ? 'OK' : 'Pendente']
  ];
  const rows = itens.map((i,idx) => `<tr><td>${idx+1}</td><td>${esc(i[0])}</td><td><span class="badge ${i[1].startsWith('OK')?'ok':''}">${esc(i[1])}</span></td></tr>`).join('');
  return `<div class="card"><h2>Checklist F-TI-16</h2><div class="form"><label>Notebook preparado<input value="${esc(p.maquina)}"></label><label>Colaborador<input value="${esc(p.candidato)}"></label><label>Data início<input value="${today()}" readonly></label><label>Analista<input value="Usuário Portal Service Desk"></label></div><div class="actions"><button class="btn" data-check="manual">Marcar instalação manual</button><button class="btn" data-check="script">Receber OK do script</button><button class="btn" data-check="inventario">Atualizar inventário via API</button><button class="btn green" data-download-checklist>Baixar checklist pelo backend</button></div><div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>#</th><th>Item</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function chamados(){
  const rows = data.chamados.map(c => `<tr><td>${c.numero}</td><td>${esc(c.titulo)}</td><td>${esc(c.solicitante)}</td><td>${esc(c.fila)}</td><td><span class="badge">${esc(c.status)}</span></td><td>${esc(c.sla)}</td></tr>`).join('');
  return shell(`<div class="page-head"><div><h1>Sistema de Chamados</h1><p class="muted">Fila, recolhimento, aquisição, pessoas, ativos e pesquisa global.</p></div></div><div class="card"><div class="toolbar"><input placeholder="Pesquisar chamado, ativo, pessoa ou serial"><select><option>Todos</option><option>Service Desk</option><option>Recolhimento</option><option>Aquisição</option></select><select><option>Todos</option><option>Novo</option><option>Em atendimento</option></select><button class="btn">Pesquisar</button></div><div class="table-wrap"><table><thead><tr><th>Número</th><th>Título</th><th>Solicitante</th><th>Fila</th><th>Status</th><th>SLA</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}
function ativos(){
  const rows = data.ativos.map(a => `<tr class="row" data-asset="${a.id}"><td>${esc(a.nome)}</td><td>${esc(a.status)}</td><td>${esc(a.empresa)}</td><td>${esc(a.modelo)}</td><td>${esc(a.usuario)}</td></tr>`).join('');
  return shell(`<div class="page-head"><div><h1>Ativos</h1><p class="muted">Clique para abrir editando direto.</p></div></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Status</th><th>Empresa</th><th>Modelo</th><th>Usuário</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}
function assetDetail(){
  const asset = data.ativos.find(a => a.id === state.selectedAssetId) || data.ativos[0];
  const d = state.assetDraft || structuredClone(asset);
  return shell(`<div class="page-head"><div><h1>Ativo ${esc(asset.nome)}</h1><p class="muted">Edição já vem ativa. Salvar habilita ao alterar.</p></div><button class="btn secondary" data-back-assets>Voltar</button></div><div class="card"><div class="form">${['nome','status','empresa','fabricante','modelo','serial','patrimonio','usuario'].map(k => `<label>${k}<input data-asset-field="${k}" value="${esc(d[k])}"></label>`).join('')}</div><div class="actions"><button class="btn green" data-save-asset ${state.assetDirty?'':'disabled'}>Salvar ativo</button><button class="btn" data-clone-asset>Clonar ativo</button><button class="btn secondary" data-discard-asset>Descartar alterações</button></div></div>`);
}

function render(){
  if(state.page === 'dashboard') app.innerHTML = dashboard();
  if(state.page === 'preparacoes') app.innerHTML = state.selectedPrepId && state.prepTab ? prepDetail() : preparacoes();
  if(state.page === 'chamados') app.innerHTML = chamados();
  if(state.page === 'ativos') app.innerHTML = state.selectedAssetId && state.assetDraft ? assetDetail() : ativos();
  bindNav(); bindPageEvents();
}
function bindPageEvents(){
  document.querySelectorAll('[data-prep]').forEach(r => r.onclick = () => { state.selectedPrepId = r.dataset.prep; state.prepTab = 'dados'; render(); });
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { state.prepTab = b.dataset.tab; render(); });
  document.querySelector('[data-back-prep]')?.addEventListener('click', () => { state.prepTab = null; render(); });
  document.querySelectorAll('[data-envio]').forEach(b => b.onclick = () => { const p = selectedPrep(); p.envio = b.dataset.envio === 'true'; p.etapas = {}; render(); });
  document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { const p = selectedPrep(); p.etapas[b.dataset.step] = true; toast('Etapa concluída.'); render(); });
  document.querySelectorAll('[data-check]').forEach(b => b.onclick = () => { const p = selectedPrep(); if(b.dataset.check === 'script') p.checklist.script = 'ok'; if(b.dataset.check === 'manual') { p.checklist.manual = true; p.checklist.script = 'na'; } if(b.dataset.check === 'inventario') p.checklist.inventario = true; render(); });
  document.querySelector('[data-download-checklist]')?.addEventListener('click', async () => { const p = selectedPrep(); try { const res = await fetch(`${apiBase}/preparacoes/${p.id}/checklist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preparation: p }) }); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Check List_${p.maquina || 'SEM_NOTE'}_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(url); } catch { toast('API não respondeu. Rode o backend para baixar o checklist.'); } });
  document.querySelectorAll('[data-asset]').forEach(r => r.onclick = () => { state.selectedAssetId = r.dataset.asset; state.assetDraft = structuredClone(data.ativos.find(a => a.id === r.dataset.asset)); state.assetDirty = false; render(); });
  document.querySelector('[data-back-assets]')?.addEventListener('click', () => { state.assetDraft = null; state.assetDirty = false; render(); });
  document.querySelectorAll('[data-asset-field]').forEach(i => i.oninput = () => { state.assetDraft[i.dataset.assetField] = i.value; state.assetDirty = true; render(); });
  document.querySelector('[data-save-asset]')?.addEventListener('click', () => { const idx = data.ativos.findIndex(a => a.id === state.selectedAssetId); data.ativos[idx] = { ...state.assetDraft, id: state.assetDraft.nome }; state.selectedAssetId = data.ativos[idx].id; state.assetDirty = false; toast('Ativo salvo.'); render(); });
  document.querySelector('[data-clone-asset]')?.addEventListener('click', () => { const clone = { ...state.assetDraft, id: `${state.assetDraft.nome}-CLONE`, nome: `${state.assetDraft.nome}-CLONE`, usuario: '-' }; data.ativos.unshift(clone); state.selectedAssetId = clone.id; state.assetDraft = structuredClone(clone); state.assetDirty = true; toast('Ativo clonado.'); render(); });
  document.querySelector('[data-discard-asset]')?.addEventListener('click', () => { state.assetDraft = structuredClone(data.ativos.find(a => a.id === state.selectedAssetId)); state.assetDirty = false; render(); });
}

render();
