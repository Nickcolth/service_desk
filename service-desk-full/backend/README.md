# Service Desk Backend

API separada para os módulos do site:

- Preparação de Máquina;
- Backup;
- geração do checklist F-TI-16.

A tela geral de chamados não fica mais aqui porque virou extensão para Edge/Chrome.

## Rodar

```powershell
cd service-desk-full/backend
npm install
npm run dev
```

A API sobe em:

```text
http://localhost:3333/api
```

## Endpoints

```http
GET   /api/health
GET   /api/dashboard
GET   /api/preparacoes
PATCH /api/preparacoes/:id
GET   /api/backups
PATCH /api/backups/:id
POST  /api/backups/:id/finalizacao/:etapa
GET   /api/ativos
POST  /api/preparacoes/:id/checklist
```

## Checklist F-TI-16

O endpoint abaixo gera um arquivo Excel para download:

```http
POST /api/preparacoes/:id/checklist
```

Para ficar exatamente igual ao documento oficial, coloque o arquivo original nesta pasta:

```text
service-desk-full/backend/templates/F-TI-16.r08_CHECK_LIST_DE_PREPARACAO_DE_EQUIPAMENTO.xlsx
```

Se o arquivo existir, o backend usa ele como modelo e preenche as células. Se não existir, ele gera um layout básico de fallback.

Isso é intencional: o modelo oficial deve ficar no backend, não no front-end.
