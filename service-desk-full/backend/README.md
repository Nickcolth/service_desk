# Service Desk Backend

API separada do Service Desk.

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
GET  /api/health
GET  /api/dashboard
GET  /api/chamados
GET  /api/preparacoes
GET  /api/ativos
PATCH /api/ativos/:id
POST /api/ativos/:id/clone
GET  /api/search?q=notebook
POST /api/preparacoes/:id/checklist
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
