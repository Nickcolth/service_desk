# Arquitetura — Service Desk

## Objetivo

Criar uma aplicação web interna para os fluxos que permanecem no site:

- preparação de máquinas;
- backup;
- geração do checklist F-TI-16;
- integrações futuras de apoio, como abertura de chamados, anexos e atualização de inventário por API.

A tela geral de Sistema de Chamados saiu do site. Esse módulo passa a ficar na extensão para Edge/Chrome.

## Separação do projeto

```text
Usuário
  ↓
Frontend estático
  ↓
Backend/API
  ↓
Banco, arquivos, automações e integrações futuras
```

## Frontend

O frontend fica simples, usando HTML, CSS e JavaScript.

Responsabilidades:

- exibir fila de preparações;
- exibir detalhes da preparação;
- controlar o fluxo de envio, expedição, recolhimento, comodato e checklist;
- exibir fila de backups;
- exibir detalhes e finalização do backup;
- chamar a API para gerar o checklist;
- alternar entre modo claro e modo escuro.

## Backend

O backend em Node.js/Express fica responsável por tudo que não deve ficar no navegador.

Responsabilidades:

- gerar checklist Excel a partir do modelo oficial;
- receber dados do front;
- futuramente consultar banco;
- futuramente abrir chamados de apoio por integração;
- futuramente anexar arquivos;
- futuramente atualizar inventário.

## Módulos ativos do site

### Preparação de Máquina

Fluxo usado para admissão e troca de equipamento.

Etapas previstas:

1. Dados da preparação;
2. Definição se haverá envio;
3. Nota de expedição;
4. Chamado de envio;
5. Chamado de recolhimento, quando for troca;
6. Chamado de comodato;
7. Checklist F-TI-16.

### Backup

Fluxo usado para controlar backup e finalização do ativo.

Etapas previstas:

1. Dados do backup;
2. Enviar e-mail para gestor;
3. Encerrar chamado;
4. Abrir chamado para Redes;
5. Desvincular colaborador do ativo;
6. Definir destino do ativo.

## Módulo removido do site

### Sistema de Chamados

Não faz mais parte do site porque virou extensão para Edge/Chrome.

O site pode continuar chamando APIs relacionadas a chamados quando precisar abrir, encerrar ou anexar algo como parte de Preparação ou Backup, mas não existe mais página geral de fila de chamados no front.

## Publicação em Linux

Modelo sugerido:

```text
Nginx
├─ serve frontend estático
└─ proxy /api para Node.js/Express
```

Exemplo:

```text
https://servicedesk.empresa.local      → frontend
https://servicedesk.empresa.local/api  → backend
```
