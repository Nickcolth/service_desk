import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const port = Number(process.env.PORT || 3333);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const db = {
  chamados: [
    { id: 1, numero: 'CH000101', titulo: 'Falha no Outlook', descricao: 'Usuário relata falha ao abrir Outlook no notebook NOTEGEO659.', solicitante: 'Pessoa Teste 001', emailSolicitante: 'teste001@empresa.com.br', empresa: 'Atmis', status: 'Novo', prioridade: 'Média', fila: 'Service Desk', responsavel: 'Sem responsável', dataAbertura: '2026-07-28', ultimaAtualizacao: '2026-07-29', ativoVinculado: 'NOTEGEO659', historico: [] },
    { id: 2, numero: 'CH000102', titulo: 'Criação de acesso', descricao: 'Solicitação de acesso para novo colaborador.', solicitante: 'Pessoa Teste 002', emailSolicitante: 'teste002@empresa.com.br', empresa: 'GEO', status: 'Em atendimento', prioridade: 'Alta', fila: 'Redes', responsavel: 'Analista Teste 001', dataAbertura: '2026-07-27', ultimaAtualizacao: '2026-07-29', ativoVinculado: null, historico: [] }
  ],
  ativos: [
    { id: 1, nome: 'NOTEGEO659', tipo: 'Notebook', status: 'Operacional', fabricante: 'Dell', modelo: 'Latitude 3550', processador: 'Intel Core i5', memoria: '16 GB', armazenamento: '512 GB SSD', serial: 'SERIALTESTE001', patrimonio: 'PAT001', nf: 'NF000001', empresa: 'GEO', usuario: 'Colaborador Teste 002', email: 'teste002@empresa.com.br', garantia: '2028-01-01', senhaBios: 'senha-bios-teste', senhaImagem: 'senha-imagem-teste' },
    { id: 2, nome: 'NOTEATMIS023', tipo: 'Notebook', status: 'Estoque', fabricante: 'Dell', modelo: 'Vostro 3520', processador: 'Intel Core i5', memoria: '8 GB', armazenamento: '256 GB SSD', serial: 'SERIALTESTE002', patrimonio: 'PAT002', nf: 'NF000002', empresa: 'Atmis', usuario: '-', email: '-', garantia: '2027-11-01', senhaBios: 'senha-bios-teste', senhaImagem: 'senha-imagem-teste' }
  ],
  preparacoes: [
    { id: 1, tipoPreparacao: 'Admissão', status: 'Finalizado RH', idVaga: 'VAG-001', candidato: 'Candidato Teste 001', empresa: 'Atmis Gestão', dataAlvo: '2026-07-30', maquina: 'NOTEATMIS024' },
    { id: 2, tipoPreparacao: 'Troca', status: 'Preparando Maquina', idVaga: '-', candidato: 'Colaborador Teste 002', empresa: 'GEO', dataAlvo: '2026-08-02', maquina: 'NOTEGEO659' }
  ],
  backups: [
    { id: 1, colaborador: 'Colaborador Teste 010', notebook: 'NOTEVEGA202', loginColaborador: 'login.teste@empresa.com.br', emailGestor: 'gestor.teste@empresa.com.br', status: 'Andamento', numeroChamado: 'CH000301', destinoAtivo: '', etapasFinalizacao: {} }
  ],
  auditoria: []
};

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchRecord(record, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalize(JSON.stringify(record));
  return terms.every(term => haystack.includes(term));
}

function audit(req, action, entity, entityId, extra = {}) {
  db.auditoria.push({
    id: db.auditoria.length + 1,
    user: req.header('x-user-email') || 'usuario.simulado@empresa.com.br',
    action,
    entity,
    entityId,
    extra,
    createdAt: new Date().toISOString()
  });
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'service-desk-api' }));

app.get('/api/search', (req, res) => {
  const q = req.query.q || '';
  const type = req.query.type || 'Todos';
  const results = [];

  if (type === 'Todos' || type === 'Chamados') {
    results.push(...db.chamados.filter(x => matchRecord(x, q)).map(x => ({ type: 'Chamado', id: x.id, title: x.numero, subtitle: x.titulo, foundIn: 'número, título, descrição, histórico, solicitante, ativo ou fila' })));
  }
  if (type === 'Todos' || type === 'Ativos') {
    results.push(...db.ativos.filter(x => matchRecord(x, q)).map(x => ({ type: 'Ativo', id: x.id, title: x.nome, subtitle: x.modelo, foundIn: 'ativo, serial, patrimônio, modelo, usuário ou empresa' })));
  }
  if (type === 'Todos' || type === 'Preparações') {
    results.push(...db.preparacoes.filter(x => matchRecord(x, q)).map(x => ({ type: 'Preparação', id: x.id, title: x.candidato, subtitle: x.tipoPreparacao, foundIn: 'candidato, máquina, empresa ou status' })));
  }

  res.json({ query: q, type, count: results.length, results });
});

app.get('/api/chamados/fila', (req, res) => res.json(db.chamados));
app.get('/api/chamados/:id', (req, res) => {
  const item = db.chamados.find(x => String(x.id) === req.params.id || x.numero === req.params.id);
  if (!item) return res.status(404).json({ error: 'Chamado não encontrado' });
  res.json(item);
});
app.patch('/api/chamados/:id/responsavel', (req, res) => {
  const item = db.chamados.find(x => String(x.id) === req.params.id || x.numero === req.params.id);
  if (!item) return res.status(404).json({ error: 'Chamado não encontrado' });
  item.responsavel = req.body.responsavel || 'Sem responsável';
  item.ultimaAtualizacao = new Date().toISOString();
  audit(req, 'update_responsavel', 'chamado', item.numero, { responsavel: item.responsavel });
  res.json(item);
});
app.patch('/api/chamados/:id/status', (req, res) => {
  const item = db.chamados.find(x => String(x.id) === req.params.id || x.numero === req.params.id);
  if (!item) return res.status(404).json({ error: 'Chamado não encontrado' });
  item.status = req.body.status || item.status;
  item.ultimaAtualizacao = new Date().toISOString();
  audit(req, 'update_status', 'chamado', item.numero, { status: item.status });
  res.json(item);
});
app.patch('/api/chamados/:id/fila', (req, res) => {
  const item = db.chamados.find(x => String(x.id) === req.params.id || x.numero === req.params.id);
  if (!item) return res.status(404).json({ error: 'Chamado não encontrado' });
  item.fila = req.body.fila || item.fila;
  item.ultimaAtualizacao = new Date().toISOString();
  audit(req, 'update_fila', 'chamado', item.numero, { fila: item.fila });
  res.json(item);
});

app.get('/api/ativos', (req, res) => res.json(db.ativos.filter(x => matchRecord(x, req.query.q || ''))));
app.get('/api/ativos/:id', (req, res) => {
  const item = db.ativos.find(x => String(x.id) === req.params.id || x.nome === req.params.id);
  if (!item) return res.status(404).json({ error: 'Ativo não encontrado' });
  res.json(item);
});
app.get('/api/ativos/prefix/:prefix/next', (req, res) => {
  const prefix = req.params.prefix.toUpperCase();
  const quantity = Math.max(1, Number(req.query.quantity || 1));
  const nums = db.ativos.map(x => x.nome).filter(x => x.startsWith(prefix)).map(x => Number(x.replace(prefix, ''))).filter(Boolean);
  const start = Math.max(0, ...nums) + 1;
  const names = Array.from({ length: quantity }, (_, i) => prefix + String(start + i).padStart(3, '0'));
  res.json({ prefix, next: names[0], quantity, names });
});
app.post('/api/ativos', (req, res) => {
  const item = { id: Date.now(), status: 'Estoque', ...req.body };
  db.ativos.push(item);
  audit(req, 'create', 'ativo', item.nome);
  res.status(201).json(item);
});
app.post('/api/ativos/batch', (req, res) => {
  const { prefix, quantity = 1, base = {} } = req.body;
  if (!prefix) return res.status(400).json({ error: 'prefix é obrigatório' });
  const nums = db.ativos.map(x => x.nome).filter(x => x.startsWith(prefix)).map(x => Number(x.replace(prefix, ''))).filter(Boolean);
  const start = Math.max(0, ...nums) + 1;
  const created = Array.from({ length: Number(quantity) }, (_, i) => ({ id: Date.now() + i, nome: prefix + String(start + i).padStart(3, '0'), status: 'Estoque', ...base }));
  db.ativos.push(...created);
  audit(req, 'create_batch', 'ativo', prefix, { quantity });
  res.status(201).json(created);
});
app.patch('/api/ativos/:id', (req, res) => {
  const item = db.ativos.find(x => String(x.id) === req.params.id || x.nome === req.params.id);
  if (!item) return res.status(404).json({ error: 'Ativo não encontrado' });
  Object.assign(item, req.body);
  audit(req, 'update', 'ativo', item.nome);
  res.json(item);
});
app.delete('/api/ativos/:id', (req, res) => {
  const index = db.ativos.findIndex(x => String(x.id) === req.params.id || x.nome === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Ativo não encontrado' });
  const [removed] = db.ativos.splice(index, 1);
  audit(req, 'delete', 'ativo', removed.nome);
  res.json({ ok: true, removed });
});
app.post('/api/ativos/:id/clone', (req, res) => {
  const item = db.ativos.find(x => String(x.id) === req.params.id || x.nome === req.params.id);
  if (!item) return res.status(404).json({ error: 'Ativo não encontrado' });
  const prefix = item.nome.replace(/\d+$/, '');
  const nums = db.ativos.map(x => x.nome).filter(x => x.startsWith(prefix)).map(x => Number(x.replace(prefix, ''))).filter(Boolean);
  const nome = prefix + String(Math.max(...nums) + 1).padStart(3, '0');
  const clone = { ...item, id: Date.now(), nome, serial: 'PENDENTE', patrimonio: 'PENDENTE', usuario: '-', email: '-', status: 'Estoque', ...req.body };
  db.ativos.push(clone);
  audit(req, 'clone', 'ativo', item.nome, { clone: nome });
  res.status(201).json(clone);
});

app.get('/api/preparacoes', (req, res) => res.json(db.preparacoes));
app.post('/api/preparacoes', (req, res) => { const item = { id: Date.now(), ...req.body }; db.preparacoes.push(item); audit(req, 'create', 'preparacao', item.id); res.status(201).json(item); });
app.get('/api/backups', (req, res) => res.json(db.backups));
app.post('/api/backups', (req, res) => { const item = { id: Date.now(), status: 'Novo', etapasFinalizacao: {}, ...req.body }; db.backups.push(item); audit(req, 'create', 'backup', item.id); res.status(201).json(item); });
app.post('/api/backups/:id/finalizacao/:etapa', (req, res) => { const item = db.backups.find(x => String(x.id) === req.params.id); if (!item) return res.status(404).json({ error: 'Backup não encontrado' }); item.etapasFinalizacao[req.params.etapa] = true; audit(req, 'finalizacao_' + req.params.etapa, 'backup', item.id); res.json(item); });
app.get('/api/auditoria', (req, res) => res.json(db.auditoria));

app.listen(port, () => console.log(`Service Desk API em http://localhost:${port}`));
