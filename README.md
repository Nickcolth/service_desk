# Service Desk

Projeto interno para protótipo web e API própria do Service Desk.

## Estrutura

```text
service_desk/
├── frontend/
│   └── index.html
├── backend/
│   ├── src/
│   ├── docs/
│   ├── package.json
│   └── README.md
├── docs/
└── .gitignore
```

## Front-end

O protótipo atual está em:

```text
frontend/index.html
```

Para abrir, basta executar o arquivo no navegador.

## Back-end / API

A API está em:

```text
backend/
```

Para rodar:

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

## Observações

- Tudo está usando dados mockados/local state.
- Não há integração real com Znuny, Service Up, SharePoint ou banco externo ainda.
- A estrutura já foi pensada para futuramente usar API própria, banco próprio de busca e SSO Microsoft/Entra ID.
