-- Rascunho inicial para banco próprio de busca do Service Desk.
-- Ainda não aplicado na API mockada.

create table ativos (
  id bigserial primary key,
  nome text not null unique,
  tipo text,
  status text,
  fabricante text,
  modelo text,
  processador text,
  memoria text,
  armazenamento text,
  serial text,
  patrimonio text,
  nf text,
  empresa text,
  usuario text,
  email text,
  garantia date,
  origem_dados text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table chamados (
  id bigserial primary key,
  numero text not null unique,
  titulo text not null,
  descricao text,
  solicitante text,
  email_solicitante text,
  empresa text,
  status text,
  prioridade text,
  fila text,
  responsavel text,
  data_abertura timestamptz,
  ultima_atualizacao timestamptz,
  ativo_vinculado text,
  origem_dados text
);

create table preparacoes (
  id bigserial primary key,
  tipo_preparacao text,
  status text,
  id_vaga text,
  candidato text,
  empresa text,
  data_alvo date,
  maquina text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table backups (
  id bigserial primary key,
  colaborador text,
  notebook text,
  login_colaborador text,
  email_gestor text,
  status text,
  numero_chamado text,
  destino_ativo text,
  etapas_finalizacao jsonb default '{}'::jsonb,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table search_index (
  id bigserial primary key,
  tipo_registro text not null,
  id_origem text not null,
  titulo text,
  resumo text,
  texto_indexado text not null,
  campos_encontraveis jsonb default '{}'::jsonb,
  origem_dados text,
  data_ultima_atualizacao timestamptz default now()
);

create index idx_search_index_texto on search_index using gin (to_tsvector('portuguese', texto_indexado));
create index idx_ativos_nome on ativos (nome);
create index idx_ativos_serial on ativos (serial);
create index idx_chamados_numero on chamados (numero);
