# Service Desk

Projeto interno do Service Desk focado nos módulos que ainda pertencem ao site:

- Preparação de Máquina;
- Backup;
- geração do checklist F-TI-16 pelo backend.

A parte de Sistema de Chamados não fica mais neste site porque virou extensão para Edge/Chrome.

## Estrutura atual

```text
service_desk/
├── service-desk-full/
│   ├── frontend/
│   │   ├── index.html
│   │   ├── server-static.js
│   │   └── src/
│   │       ├── main.js
│   │       └── styles.css
│   └── backend/
│       ├── src/server.js
│       ├── package.json
│       ├── README.md
│       └── templates/
└── docs/
    └── arquitetura.md
```

## Rodar localmente

Backend/API:

```powershell
cd service-desk-full/backend
npm install
npm run dev
```

Frontend estático:

```powershell
cd service-desk-full/frontend
npm run dev
```

Também dá para abrir o front pelo Live Server do VS Code.

## Checklist

Para o checklist sair com o layout oficial, coloque o modelo original neste caminho:

```text
service-desk-full/backend/templates/F-TI-16.r08_CHECK_LIST_DE_PREPARACAO_DE_EQUIPAMENTO.xlsx
```

O front chama o backend para gerar e baixar o arquivo preenchido.
