# Service Desk Full

Estrutura separada para o projeto real do Service Desk.

O site ficou focado somente em:

- Preparação de Máquina;
- Backup.

A parte de Sistema de Chamados não fica mais no site porque virou extensão para Edge/Chrome.

## Estrutura

```text
service-desk-full/
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ server-static.js
│  └─ src/
│     ├─ main.js
│     └─ styles.css
└─ backend/
   ├─ package.json
   ├─ src/
   │  └─ server.js
   └─ templates/
      └─ F-TI-16.r08_CHECK_LIST_DE_PREPARACAO_DE_EQUIPAMENTO.xlsx
```

## Rodar localmente

API:

```powershell
cd service-desk-full/backend
npm install
npm run dev
```

Front simples, sem Vite:

```powershell
cd service-desk-full/frontend
npm run dev
```

Também pode abrir pelo Live Server do VS Code.

## Produção em Linux

Em produção, o front pode ser servido como arquivo estático pelo Nginx, Apache ou IIS. O backend Node/Express roda separado e recebe as chamadas em `/api`.

Exemplo:

```text
https://servicedesk.empresa.local/       -> frontend estático
https://servicedesk.empresa.local/api    -> backend Node/Express
```

## Checklist

O caminho correto é o backend gerar o arquivo. O front apenas chama a API e baixa/anexa o resultado.

Para preservar exatamente o layout original, coloque o modelo oficial em:

```text
service-desk-full/backend/templates/F-TI-16.r08_CHECK_LIST_DE_PREPARACAO_DE_EQUIPAMENTO.xlsx
```

Se o arquivo existir, o backend preenche esse modelo. Se não existir, ele gera um fallback básico.
