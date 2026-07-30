const apiBase = window.SERVICE_DESK_API_BASE_URL || (
  ['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '3333'
    ? 'http://localhost:3333/api'
    : '/api'
);

const app = document.querySelector('#app');
const toastEl = document.querySelector('#toast');

const state = {
  page: 'dashboard',
  selectedPrepId: null,
  prepTab: 'dados',
  selectedBackupId: null,
  backupFinish: false,
  backupDraft: null,
  theme: localStorage.getItem('serviceDeskTheme') || 'light'
};

const data = {
  preparacoes: [
    {
      id: 'prep-1',
      tipo: 'Admissão',
      candidato: 'Candidato Teste 001',
      empresa: 'Atmis Gestão',
      maquina: 'NOTEGESTAO024',
      notebookAntigo: '',
      telefone: '(00) 00000-0000',
      centroCusto: 'Centro Teste 001',
      email: 'candidato.teste001@empresa.com.br',
      endereco: 'Endereço de teste, 123',
      cep: '00000-000',
      dataAlvo: '2026-07-30',
      status: 'Finalizado RH',
      envio: null,
      etapas: {},
      checklist: {}
    },
    {
      id: 'prep-2',
      tipo: 'Troca',
      candidato: 'Colaborador Teste 002',
      empresa: 'GEO',
      maquina: 'NOTEGEO659',
      notebookAntigo: 'NOTEGEO410',
      telefone: '(00) 00000-0000',
      centroCusto: 'Centro Teste 002',
      email: 'colaborador.teste002@empresa.com.br',
      endereco: 'Endereço de teste, 456',
      cep: '00000-000',
      dataAlvo: '2026-08-02',
      status: 'Preparando Máquina',
      envio: true,
      etapas: {},
      checklist: {}
    }
  ],
  backups: [
    {
      id: 'backup-1',
      colaborador: 'Colaborador Teste 010',
      notebook: 'NOTEVEGA202',
      login: 'login.teste010@empresa.com.br',
      senha: 'senha-temporaria',
      emailGestor: 'gestor.teste@empresa.com.br',
      status: 'Andamento',
      numeroChamado: 'CH000301',
      falhas: '',
      destinoAtivo: 'Estoque',
      etapas: {}
    },
    {
      id: 'backup-2',
      colaborador: 'Colaborador Teste 011',
      notebook: 'NOTEATMIS088',
      login: 'login.teste011@empresa.com.br',
      senha: 'senha-temporaria',
      emailGestor: 'gestor.teste2@empresa.com.br',
      status: 'Novo',
      numeroChamado: 'CH000302',
      falhas: '',
      destinoAtivo: 'Manutenção',
      etapas: {}
    }
  ]
};

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[char]));

const today = () => new Date().toLocaleDateString('pt-BR');
const isoToday = () => new Date().toISOString().slice(0, 10);
const safeName = value => String(value || 'SEM_NOTE').trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'SEM_NOTE';

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('serviceDeskTheme', state.theme);
  applyTheme();
  render();
}

function themeButton() {
  const isDark = state.theme === 'dark';
  return `<button class="theme-toggle" data-theme-toggle aria-label="Alternar modo claro e escuro">
    <span>${isDark ? '☀' : '☾'}</span><span>${isDark ? 'Modo claro' : 'Modo escuro'}</span>
  </button>`;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2500);
}

function shell(content) {
  return `<div class="layout">
    <header class="top">
      <div class="brand"><span class="brand-icon">S</span><span>Service Desk</span></div>
      <div class="top-actions"><div class="top-note">Preparação de Máquina e Backup</div>${themeButton()}</div>
    </header>
    <aside class="side">
      ${nav('dashboard', '⌂', 'Início')}
      ${nav('preparacoes', '▣', 'Preparação de Máquina')}
      ${nav('backup', '⇄', 'Backup')}
    </aside>
    <section class="main">${content}</section>
  </div>`;
}

function nav(page, icon, label) {
  return `<button class="nav ${state.page === page ? 'active' : ''}" data-nav="${page}"><span>${icon}</span><span>${label}</span></button>`;
}

function setPage(page) {
  state.page = page;
  state.selectedPrepId = null;
  state.selectedBackupId = null;
  state.backupFinish = false;
  state.backupDraft = null;
  render();
}

function bindNav() {
  document.querySelectorAll('[data-nav]').forEach(button => {
    button.onclick = () => setPage(button.dataset.nav);
  });
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', toggleTheme);
}

function dashboard() {
  const backupsAbertos = data.backups.filter(item => item.status !== 'Finalizado').length;
  const preparacoesAbertas = data.preparacoes.filter(item => !['Finalizado TI', 'Concluído'].includes(item.status)).length;

  return shell(`<div class="page-head">
    <div><h1>Visão geral</h1><p class="muted">O site ficou focado em preparação de máquina e backup. A parte de chamados fica na extensão do Edge/Chrome.</p></div>
  </div>
  <div class="grid kpis">
    <div class="card kpi">Preparações abertas<b>${preparacoesAbertas}</b></div>
    <div class="card kpi">Backups abertos<b>${backupsAbertos}</b></div>
    <div class="card kpi">Checklist via API<b>Pronto</b></div>
    <div class="card kpi">Chamados<b>Extensão</b></div>
  </div>
  <div class="grid two">
    <div class="card"><h2>Fluxo do site</h2><p>O front fica simples, em HTML, CSS e JavaScript. Ele chama a API somente para ações que precisam de backend, como gerar o checklist no modelo original.</p></div>
    <div class="card"><h2>Integrações futuras</h2><p>Preparação e Backup podem abrir chamados, anexar arquivos e consultar dados por API. A tela geral de chamados não precisa existir aqui porque virou extensão.</p></div>
  </div>`);
}

function preparacoesPage() {
  const rows = data.preparacoes.map(p => `<tr class="row" data-prep="${p.id}">
    <td>${esc(p.candidato)}</td><td>${esc(p.tipo)}</td><td>${esc(p.empresa)}</td><td>${esc(p.maquina || '-')}</td><td>${esc(p.dataAlvo || '-')}</td><td><span class="badge warn">${esc(p.status)}</span></td>
  </tr>`).join('');

  return shell(`<div class="page-head">
    <div><h1>Preparação de Máquina</h1><p class="muted">Fila própria para admissões e trocas. Clique na linha para abrir o fluxo.</p></div>
    <button class="btn" data-new-prep>+ Nova preparação</button>
  </div>
  <div class="card">
    <div class="toolbar prep-toolbar">
      <input id="prepSearch" placeholder="Pesquisar candidato, máquina ou empresa" />
      <select id="prepType"><option>Todos</option><option>Admissão</option><option>Troca</option></select>
      <select id="prepStatus"><option>Todos</option><option>Finalizado RH</option><option>Preparando Máquina</option><option>Aguardando Envio</option><option>Finalizado TI</option></select>
      <button class="btn secondary">Atualizar BD</button>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Colaborador</th><th>Tipo</th><th>Empresa</th><th>Máquina</th><th>Data alvo</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`);
}

function selectedPrep() {
  return data.preparacoes.find(p => p.id === state.selectedPrepId) || data.preparacoes[0];
}

function prepDetailPage() {
  const p = selectedPrep();
  const tabs = ['dados', 'funções', 'checklist'].map(tab => `<button class="tab ${state.prepTab === tab ? 'active' : ''}" data-prep-tab="${tab}">${tab}</button>`).join('');
  const content = state.prepTab === 'funções' ? prepFunctions(p) : state.prepTab === 'checklist' ? prepChecklist(p) : prepData(p);

  return shell(`<div class="page-head">
    <div><h1>Preparação - ${esc(p.candidato)}</h1><p class="muted">${esc(p.tipo)} • ${esc(p.maquina || '-')}</p></div>
    <button class="btn secondary" data-back-preps>Voltar</button>
  </div>
  <div class="tabs">${tabs}</div>${content}`);
}

function prepData(p) {
  return `<div class="card"><div class="form">
    ${field('Tipo de preparação', p.tipo)}
    ${field('Nome', p.candidato)}
    ${field('Empresa', p.empresa)}
    ${field('Máquina', p.maquina)}
    ${field('Telefone', p.telefone)}
    ${field('Centro de custo', p.centroCusto)}
    ${field('E-mail', p.email)}
    ${field('CEP', p.cep)}
    ${field('Endereço completo', p.endereco, 'full')}
    ${field('Notebook antigo', p.notebookAntigo || '-', 'full')}
  </div></div>`;
}

function field(label, value, className = '') {
  return `<label class="${className}">${esc(label)}<input value="${esc(value || '')}" /></label>`;
}

function prepFunctions(p) {
  const isTroca = p.tipo === 'Troca';
  const f = p.etapas;
  const steps = [
    ['expedicao', 'Nota de Expedição', p.envio === true],
    ['envio', 'Chamado de Envio', p.envio === true && f.expedicao],
    ['recolhimento', 'Chamado de Recolhimento', isTroca && (p.envio === false || f.envio)],
    ['comodato', 'Chamado de Comodato', (p.envio === false || f.envio) && (!isTroca || f.recolhimento)],
    ['checklist', 'Checklist em Excel', f.comodato]
  ];

  return `<div class="card"><h2>Funções da preparação</h2>
    <div class="choice-block">
      <strong>Fluxo de envio</strong>
      <div class="actions"><button class="btn ${p.envio === true ? 'green' : ''}" data-envio="true">Será enviado</button><button class="btn secondary ${p.envio === false ? 'green' : ''}" data-envio="false">Não será enviado</button></div>
      <p class="muted">${p.envio === null ? 'Defina se terá envio para liberar as próximas etapas.' : p.envio ? 'Segue por expedição e envio antes do comodato.' : 'Pula expedição/envio e segue direto para as próximas etapas.'}</p>
    </div>
    <div class="steps">${steps.map(([key, title, available]) => `<button class="step ${f[key] ? 'done' : ''}" data-step="${key}" ${available ? '' : 'disabled'}>${title}<br><small>${f[key] ? 'Concluído' : 'Pendente'}</small></button>`).join('')}</div>
    <div class="status-list">
      <div class="mini-card"><strong>Expedição</strong>${f.expedicao ? 'OK' : '-'}</div>
      <div class="mini-card"><strong>Envio</strong>${f.envio ? 'OK' : '-'}</div>
      ${isTroca ? `<div class="mini-card"><strong>Recolhimento</strong>${f.recolhimento ? 'OK' : '-'}</div>` : ''}
      <div class="mini-card"><strong>Comodato</strong>${f.comodato ? 'OK' : '-'}</div>
      <div class="mini-card"><strong>Checklist</strong>${f.checklist ? 'Gerado' : '-'}</div>
    </div>
  </div>`;
}

function checklistItems(p) {
  const script = p.checklist.script === 'ok';
  const manual = p.checklist.manual === true;
  return [
    ['Formatar notebook / Instalar o Windows', 'OK'],
    ['Criar usuário padrão chamado Imagem', 'OK'],
    ['Nomear a máquina', 'OK'],
    ['Ingressar o computador no domínio', 'OK'],
    ['Configurar usuário ADM local', 'OK'],
    ['Realizar o logon com usuário de rede do colaborador', 'OK'],
    ['Executar script Instalação Automatizada', script ? 'OK automático' : manual ? 'N/A' : 'Pendente'],
    ['Instaladores individuais cobertos pelo script', script ? 'N/A' : manual ? 'OK manual' : 'Pendente'],
    ['Instalar e atualizar drivers', p.etapas.drivers ? 'OK automático' : 'Pendente'],
    ['Ativar BitLocker', p.etapas.bitlocker ? 'OK automático' : 'Pendente'],
    ['Realizar atualização via winget upgrade --all', p.etapas.winget ? 'OK automático' : 'Pendente'],
    ['Executar GPUPDATE / FORCE', p.etapas.gpupdate ? 'OK automático' : 'Pendente'],
    ['Abrir chamado para emissão de nota fiscal de saída', p.envio === false ? 'N/A' : p.etapas.expedicao ? 'OK' : 'Pendente'],
    ['Atualizar inventário no sistema de ativos', p.checklist.inventario ? 'OK automático' : 'Pendente'],
    ['Solicitar termo de entrega F-TI-02', p.etapas.comodato ? 'OK' : 'Pendente'],
    ['Habilitar MFA', 'Pendente']
  ];
}

function prepChecklist(p) {
  const rows = checklistItems(p).map((item, index) => `<tr><td>${index + 1}</td><td>${esc(item[0])}</td><td><span class="badge ${item[1].startsWith('OK') ? 'ok' : item[1] === 'N/A' ? '' : 'warn'}">${esc(item[1])}</span></td></tr>`).join('');
  return `<div class="card"><h2>Checklist F-TI-16</h2>
    <div class="form">
      <label>Notebook preparado<input value="${esc(p.maquina || '')}" /></label>
      <label>Colaborador<input value="${esc(p.candidato || '')}" /></label>
      <label>Data de início<input value="${today()}" readonly /></label>
      <label>Nome do analista<input value="Usuário Portal Service Desk" /></label>
    </div>
    <div class="actions">
      <button class="btn" data-check="manual">Marcar instalação manual</button>
      <button class="btn" data-check="script">Receber OK do script</button>
      <button class="btn" data-check="inventario">Atualizar inventário via API</button>
      <button class="btn green" data-download-checklist>Baixar checklist pelo backend</button>
    </div>
    <p class="muted">O download chama o backend. Se o modelo original estiver na pasta templates, o arquivo gerado fica com o layout oficial.</p>
    <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>#</th><th>Item</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}

function backupPage() {
  const rows = data.backups.map(b => `<tr class="row" data-backup="${b.id}">
    <td>${esc(b.colaborador)}</td><td>${esc(b.notebook)}</td><td>${esc(b.login)}</td><td>${esc(b.numeroChamado)}</td><td><span class="badge ${b.status === 'Finalizado' ? 'ok' : 'warn'}">${esc(b.status)}</span></td><td>${esc(b.destinoAtivo || '-')}</td>
  </tr>`).join('');

  return shell(`<div class="page-head">
    <div><h1>Backup</h1><p class="muted">Fila de backups e finalização de ativos sem depender da tela de chamados.</p></div>
    <button class="btn" data-new-backup>+ Novo backup</button>
  </div>
  <div class="card">
    <div class="toolbar backup-toolbar">
      <input placeholder="Pesquisar colaborador, notebook ou login" />
      <select><option>Todos</option><option>Novo</option><option>Andamento</option><option>Finalizado</option></select>
      <button class="btn secondary">Atualizar BD</button>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Colaborador</th><th>Notebook</th><th>Login</th><th>Chamado</th><th>Status</th><th>Destino</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`);
}

function selectedBackup() {
  return data.backups.find(b => b.id === state.selectedBackupId) || data.backups[0];
}

function backupDetailPage() {
  const backup = selectedBackup();
  const draft = state.backupDraft || structuredClone(backup);
  const content = state.backupFinish ? backupFinishView(draft) : backupDataView(draft);
  return shell(`<div class="page-head">
    <div><h1>Backup - ${esc(backup.notebook)}</h1><p class="muted">${esc(backup.colaborador)} • ${esc(backup.numeroChamado)}</p></div>
    <button class="btn secondary" data-back-backups>Voltar</button>
  </div>${content}`);
}

function backupDataView(draft) {
  return `<div class="card"><h2>Dados do backup</h2>
    <div class="form">
      <label>Status<select data-backup-field="status"><option ${draft.status === 'Novo' ? 'selected' : ''}>Novo</option><option ${draft.status === 'Andamento' ? 'selected' : ''}>Andamento</option><option ${draft.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option></select></label>
      <label>Colaborador<input data-backup-field="colaborador" value="${esc(draft.colaborador)}" /></label>
      <label>Notebook<input data-backup-field="notebook" value="${esc(draft.notebook)}" /></label>
      <label>Login do colaborador<input data-backup-field="login" value="${esc(draft.login)}" /></label>
      <label>Senha<input data-backup-field="senha" value="${esc(draft.senha)}" /></label>
      <label>E-mail do gestor<input data-backup-field="emailGestor" value="${esc(draft.emailGestor)}" /></label>
      <label>Nº chamado<input data-backup-field="numeroChamado" value="${esc(draft.numeroChamado)}" /></label>
      <label>Destino ativo<select data-backup-field="destinoAtivo"><option ${draft.destinoAtivo === 'Estoque' ? 'selected' : ''}>Estoque</option><option ${draft.destinoAtivo === 'Manutenção' ? 'selected' : ''}>Manutenção</option><option ${draft.destinoAtivo === 'Descarte' ? 'selected' : ''}>Descarte</option><option ${draft.destinoAtivo === 'Garantia' ? 'selected' : ''}>Garantia</option></select></label>
      <label class="full">Falhas<textarea data-backup-field="falhas" rows="4">${esc(draft.falhas || '')}</textarea></label>
    </div>
    <div class="actions"><button class="btn green" data-save-backup>Salvar</button><button class="btn" data-go-finish>Continuar para finalização</button></div>
  </div>`;
}

function backupFinishView(draft) {
  const steps = [
    ['emailGestor', 'Enviar e-mail para gestor'],
    ['encerrarChamado', 'Encerrar chamado'],
    ['chamadoRedes', 'Abrir chamado para Redes'],
    ['desvincularAtivo', 'Desvincular colaborador do ativo'],
    ['destinoAtivo', `Definir destino do ativo: ${draft.destinoAtivo || '-'}`]
  ];
  return `<div class="card"><h2>Finalizar backup</h2>
    <p class="muted">As etapas são simuladas por enquanto. Depois entram as integrações reais com e-mail, chamados e gestão de ativos.</p>
    <div class="steps vertical">${steps.map(([key, title]) => `<button class="step ${draft.etapas?.[key] ? 'done' : ''}" data-backup-step="${key}">${esc(title)}<br><small>${draft.etapas?.[key] ? 'Concluído' : 'Pendente'}</small></button>`).join('')}</div>
    <div class="actions"><button class="btn secondary" data-back-data>Voltar para dados do backup</button><button class="btn green" data-save-backup>Salvar finalização</button></div>
  </div>`;
}

function render() {
  applyTheme();
  if (state.page === 'dashboard') app.innerHTML = dashboard();
  if (state.page === 'preparacoes') app.innerHTML = state.selectedPrepId ? prepDetailPage() : preparacoesPage();
  if (state.page === 'backup') app.innerHTML = state.selectedBackupId ? backupDetailPage() : backupPage();
  bindNav();
  bindPageEvents();
}

function bindPageEvents() {
  document.querySelectorAll('[data-prep]').forEach(row => row.onclick = () => { state.selectedPrepId = row.dataset.prep; state.prepTab = 'dados'; render(); });
  document.querySelector('[data-back-preps]')?.addEventListener('click', () => { state.selectedPrepId = null; render(); });
  document.querySelectorAll('[data-prep-tab]').forEach(button => button.onclick = () => { state.prepTab = button.dataset.prepTab; render(); });
  document.querySelectorAll('[data-envio]').forEach(button => button.onclick = () => { const p = selectedPrep(); p.envio = button.dataset.envio === 'true'; p.etapas = {}; render(); });
  document.querySelectorAll('[data-step]').forEach(button => button.onclick = () => { const p = selectedPrep(); p.etapas[button.dataset.step] = true; if (button.dataset.step === 'checklist') state.prepTab = 'checklist'; toast('Etapa concluída.'); render(); });
  document.querySelectorAll('[data-check]').forEach(button => button.onclick = () => { const p = selectedPrep(); if (button.dataset.check === 'script') p.checklist.script = 'ok'; if (button.dataset.check === 'manual') { p.checklist.manual = true; p.checklist.script = 'na'; } if (button.dataset.check === 'inventario') p.checklist.inventario = true; render(); });
  document.querySelector('[data-download-checklist]')?.addEventListener('click', downloadChecklist);

  document.querySelectorAll('[data-backup]').forEach(row => row.onclick = () => { state.selectedBackupId = row.dataset.backup; state.backupDraft = structuredClone(selectedBackup()); state.backupFinish = false; render(); });
  document.querySelector('[data-back-backups]')?.addEventListener('click', () => { state.selectedBackupId = null; state.backupDraft = null; state.backupFinish = false; render(); });
  document.querySelector('[data-go-finish]')?.addEventListener('click', () => { state.backupFinish = true; render(); });
  document.querySelector('[data-back-data]')?.addEventListener('click', () => { state.backupFinish = false; render(); });
  document.querySelectorAll('[data-backup-field]').forEach(input => input.oninput = () => { state.backupDraft[input.dataset.backupField] = input.value; });
  document.querySelectorAll('[data-backup-field]').forEach(input => input.onchange = () => { state.backupDraft[input.dataset.backupField] = input.value; });
  document.querySelectorAll('[data-backup-step]').forEach(button => button.onclick = () => { state.backupDraft.etapas = state.backupDraft.etapas || {}; state.backupDraft.etapas[button.dataset.backupStep] = true; toast('Etapa do backup concluída.'); render(); });
  document.querySelector('[data-save-backup]')?.addEventListener('click', saveBackupDraft);

  document.querySelector('[data-new-prep]')?.addEventListener('click', () => toast('A tela de nova preparação entra na próxima etapa.'));
  document.querySelector('[data-new-backup]')?.addEventListener('click', () => toast('A tela de novo backup entra na próxima etapa.'));
}

async function downloadChecklist() {
  const p = selectedPrep();
  try {
    const response = await fetch(`${apiBase}/preparacoes/${p.id}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preparation: p })
    });
    if (!response.ok) throw new Error('Falha ao gerar checklist');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Check List_${safeName(p.maquina)}_${isoToday()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast('API não respondeu. Rode o backend para baixar o checklist.');
  }
}

function saveBackupDraft() {
  const index = data.backups.findIndex(item => item.id === state.selectedBackupId);
  if (index >= 0) {
    data.backups[index] = structuredClone(state.backupDraft);
    toast('Backup salvo.');
    render();
  }
}

applyTheme();
render();
