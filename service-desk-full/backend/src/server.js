import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ExcelJS from 'exceljs';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3333);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const db = {
  chamados: [
    { numero: 'CH000101', titulo: 'Falha no Outlook', fila: 'Service Desk', status: 'Novo', solicitante: 'Pessoa Teste 001', sla: 'Expira em 45 min' },
    { numero: 'CH000102', titulo: 'Recolhimento de notebook', fila: 'Recolhimento', status: 'Em atendimento', solicitante: 'Pessoa Teste 002', sla: 'OK' },
    { numero: 'CH000103', titulo: 'Aquisição de notebook', fila: 'Aquisição', status: 'Novo', solicitante: 'Pessoa Teste 003', sla: 'Expirado' }
  ],
  ativos: [
    { id: 'NOTEGEO659', nome: 'NOTEGEO659', status: 'Operacional', empresa: 'GEO', fabricante: 'Dell', modelo: 'Latitude 3550', serial: 'SERIALTESTE001', patrimonio: 'PAT001', usuario: 'Colaborador Teste 002' },
    { id: 'NOTEKAFFA031', nome: 'NOTEKAFFA031', status: 'Estoque', empresa: 'Kaffa', fabricante: 'Dell', modelo: 'Vostro 3520', serial: 'SERIALTESTE002', patrimonio: 'PAT002', usuario: '-' }
  ],
  preparacoes: [
    { id: 'prep-1', tipo: 'Admissão', candidato: 'Candidato Teste 001', empresa: 'Atmis Gestão', maquina: 'NOTEGESTAO024', notebookAntigo: '', status: 'Finalizado RH' },
    { id: 'prep-2', tipo: 'Troca', candidato: 'Colaborador Teste 002', empresa: 'GEO', maquina: 'NOTEGEO659', notebookAntigo: 'NOTEGEO410', status: 'Preparando Máquina' }
  ]
};

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function match(record, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const haystack = normalize(JSON.stringify(record));
  return terms.every(term => haystack.includes(term));
}
function safeName(value) {
  return String(value || 'SEM_NOTE').trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'SEM_NOTE';
}
function todayBr() {
  return new Date().toLocaleDateString('pt-BR');
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'service-desk-full-api' }));
app.get('/api/dashboard', (req, res) => res.json({ preparacoes: db.preparacoes.length, chamados: db.chamados.length, ativos: db.ativos.length }));
app.get('/api/chamados', (req, res) => res.json(db.chamados));
app.get('/api/preparacoes', (req, res) => res.json(db.preparacoes));
app.get('/api/ativos', (req, res) => res.json(db.ativos.filter(a => match(a, req.query.q || ''))));
app.patch('/api/ativos/:id', (req, res) => {
  const idx = db.ativos.findIndex(a => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Ativo não encontrado' });
  db.ativos[idx] = { ...db.ativos[idx], ...req.body, id: req.body.nome || db.ativos[idx].id };
  res.json(db.ativos[idx]);
});
app.post('/api/ativos/:id/clone', (req, res) => {
  const asset = db.ativos.find(a => a.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Ativo não encontrado' });
  const clone = { ...asset, id: `${asset.id}-CLONE`, nome: `${asset.nome}-CLONE`, usuario: '-' };
  db.ativos.unshift(clone);
  res.status(201).json(clone);
});
app.get('/api/search', (req, res) => {
  const q = req.query.q || '';
  res.json({ results: [
    ...db.chamados.filter(x => match(x, q)).map(x => ({ type: 'Chamado', title: x.numero, subtitle: x.titulo })),
    ...db.ativos.filter(x => match(x, q)).map(x => ({ type: 'Ativo', title: x.nome, subtitle: x.modelo })),
    ...db.preparacoes.filter(x => match(x, q)).map(x => ({ type: 'Preparação', title: x.candidato, subtitle: x.maquina }))
  ] });
});

async function loadChecklistWorkbook() {
  const templatePath = path.join(__dirname, '..', 'templates', 'F-TI-16.r08_CHECK_LIST_DE_PREPARACAO_DE_EQUIPAMENTO.xlsx');
  const workbook = new ExcelJS.Workbook();
  if (existsSync(templatePath)) {
    await workbook.xlsx.load(await readFile(templatePath));
    return workbook;
  }
  const sheet = workbook.addWorksheet('Chek-List Imagem');
  sheet.columns = [{ width: 10 }, { width: 90 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }];
  sheet.mergeCells('B1:F1'); sheet.getCell('B1').value = 'CHECKLIST DE PREPARAÇÃO DE EQUIPAMENTO';
  sheet.getCell('G1').value = 'F-TI-16'; sheet.getCell('G2').value = 'Revisão: 08';
  sheet.getRow(1).font = { bold: true, size: 14 };
  return workbook;
}
function setCell(ws, address, value) {
  const cell = ws.getCell(address);
  cell.value = value;
  cell.alignment = { vertical: 'middle', wrapText: true };
  return cell;
}
function fillChecklistRows(ws, statuses) {
  const labels = [
    'Formatar notebook / Instalar o Windows',
    'Criar usuário padrão chamado Imagem, com a senha padrão utilizada',
    'Nomear a máquina',
    'Ingressar o computador no domínio',
    'Configurar usuário ADM local',
    'Realizar o logon com usuário de rede do colaborador',
    'Executar script "Instalação Automatizada"',
    'Instalar o Google Chrome, Mozilla, Adobe Reader, JAVA, 7-zip e Dell Support Assist',
    'Instalar o Office 365',
    'Guardian, Metering e MoreMesh',
    'Instalar o Sophos',
    'Criar senha aleatória para BIOS e usuário Imagem',
    'Remover usuário ADM local',
    'Instalar e atualizar os drivers',
    'Configurar o Onedrive for Business',
    'Ativar o BitLocker',
    'Configurar o Outlook',
    'Confirmar ativação do Office 365 com a conta do usuário',
    'Instalar VPN Sophos / configurar',
    'Realizar atualização via winget upgrade --all',
    'Executar GPUPDATE / FORCE',
    'Validar pastas migradas para OneDrive, exceto Downloads',
    'Realizar a verificação dos Agentes de Segurança',
    'Configurar o Guardian',
    'Abrir chamado para emissão de nota fiscal de saída',
    'Atualizar o inventário no sistema de Gestão de Ativos',
    'Solicitar o termo de entrega de equipamento via Docusign',
    'Habilitar o MFA'
  ];
  labels.forEach((label, index) => {
    const row = 7 + index;
    if (!ws.getCell(`B${row}`).value) setCell(ws, `B${row}`, label);
    setCell(ws, `A${row}`, statuses[index] || 'Pendente');
  });
}

app.post('/api/preparacoes/:id/checklist', async (req, res, next) => {
  try {
    const p = req.body.preparation || db.preparacoes.find(x => x.id === req.params.id) || {};
    const workbook = await loadChecklistWorkbook();
    const ws = workbook.getWorksheet('Chek-List Imagem') || workbook.worksheets[0];
    const data = todayBr();
    const maquina = p.maquina || 'SEM_NOTE';
    const colaborador = p.candidato || 'Colaborador Teste';
    const analista = p.analista || 'Usuário Portal Service Desk';

    setCell(ws, 'C5', maquina);
    setCell(ws, 'E5', colaborador);
    setCell(ws, 'G5', data);
    setCell(ws, 'C35', analista);
    setCell(ws, 'G35', data);

    const scriptOk = p.checklist?.script === 'ok';
    const manual = p.checklist?.manual === true;
    const statuses = ['OK','OK','OK','OK','OK','OK'];
    statuses[6] = scriptOk ? 'OK automático' : manual ? 'N/A' : 'Pendente';
    for (let i = 7; i <= 12; i++) statuses[i] = scriptOk ? 'N/A' : manual ? 'OK manual' : 'Pendente';
    statuses[13] = p.etapas?.drivers ? 'OK automático' : 'Pendente';
    statuses[14] = 'Pendente'; statuses[15] = p.etapas?.bitlocker ? 'OK automático' : 'Pendente';
    statuses[16] = 'Pendente'; statuses[17] = 'Pendente'; statuses[18] = 'Pendente';
    statuses[19] = p.etapas?.winget ? 'OK automático' : 'Pendente';
    statuses[20] = p.etapas?.gpupdate ? 'OK automático' : 'Pendente';
    statuses[21] = 'Pendente'; statuses[22] = p.etapas?.securityAgents ? 'OK automático' : 'Pendente';
    statuses[23] = p.etapas?.guardian ? 'OK automático' : 'Pendente';
    statuses[24] = p.envio === false ? 'N/A' : p.etapas?.expedicao ? 'OK' : 'Pendente';
    statuses[25] = p.checklist?.inventario ? 'OK automático' : 'Pendente';
    statuses[26] = p.etapas?.comodato ? 'OK' : 'Pendente';
    statuses[27] = 'Pendente';
    fillChecklistRows(ws, statuses);

    ws.eachRow(row => row.eachCell(cell => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    }));

    const fileName = `Check List_${safeName(maquina)}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno', detail: err.message });
});

app.listen(port, () => console.log(`Service Desk API em http://localhost:${port}`));
