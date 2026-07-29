# Service Desk Full

Estrutura separada para o projeto real do Service Desk.

Esta pasta deixa o protótipo de um arquivo só para trás e separa o sistema em:

```text
service-desk-full/
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  └─ src/
│     ├─ main.js
│     └─ styles.css
└─ backend/
   ├─ package.json
   └─ src/
      └─ server.js
```

## Rodar localmente

API:

```powershell
cd service-desk-full/backend
npm install
npm run dev
```

Front:

```powershell
cd service-desk-full/frontend
npm install
npm run dev
```

## O que já está separado

- Front-end separado do back-end.
- Dados mockados centralizados na API.
- Tela de preparações.
- Detalhe de preparação com fluxo de funções.
- Chamado de expedição, envio, recolhimento para troca, comodato e checklist.
- Tela de ativos com edição direta, salvar e clonar.
- Endpoint de checklist preparado para gerar Excel pelo backend.

## Checklist

O caminho correto é o backend gerar o arquivo. O front apenas chama a API e baixa/anexa o resultado.

Na versão final, o arquivo original `F-TI-16.r08_CHECK_LIST_DE_PREPARACAO_DE_EQUIPAMENTO.xlsx` deve ficar no backend como template oficial para preservar exatamente o layout original.
