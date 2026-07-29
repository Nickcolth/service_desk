# Service Desk API

API inicial para o projeto Service Desk.

## Rodar localmente

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

Teste:

```powershell
curl http://localhost:3333/api/health
```

## Endpoints principais

### Busca

```http
GET /api/search?q=notegeo659&type=Todos
```

Tipos aceitos:

- Todos
- Chamados
- Ativos
- Preparações

### Chamados

```http
GET /api/chamados/fila
GET /api/chamados/CH000101
PATCH /api/chamados/CH000101/responsavel
PATCH /api/chamados/CH000101/status
PATCH /api/chamados/CH000101/fila
```

### Ativos

```http
GET /api/ativos?q=notegeo
GET /api/ativos/NOTEGEO659
GET /api/ativos/prefix/NOTEGEO/next?quantity=5
POST /api/ativos
POST /api/ativos/batch
PATCH /api/ativos/NOTEGEO659
DELETE /api/ativos/NOTEGEO659
POST /api/ativos/NOTEGEO659/clone
```

### Preparações

```http
GET /api/preparacoes
POST /api/preparacoes
```

### Backups

```http
GET /api/backups
POST /api/backups
POST /api/backups/1/finalizacao/emailGestor
```

## Segurança futura

A API foi pensada para futuramente receber SSO Microsoft/Entra ID:

- o front-end envia token/sessão;
- a API valida o usuário;
- a API aplica permissões;
- o backend consulta banco, Znuny, Service Up ou SharePoint;
- credenciais e secrets ficam somente no backend.

## Observação

Esta primeira versão usa dados em memória/mockados. Ainda não há banco real.
