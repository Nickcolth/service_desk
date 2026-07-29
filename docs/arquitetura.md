# Arquitetura — Service Desk

## Objetivo

Criar uma aplicação web interna para o Service Desk com:

- front-end melhor para preparação de máquinas;
- backup;
- sistema de chamados;
- fila de atendimento;
- pesquisa global;
- gestão de ativos;
- API própria;
- banco próprio de busca no futuro.

## Desenho lógico

```text
Front-end Service Desk
        ↓
API própria
        ↓
Banco próprio de busca / indexação
        ↓
Integrações externas
- Znuny
- Service Up
- SharePoint
- base oficial de ativos
```

## Motivo da API própria

A tela não deve depender diretamente do Znuny, Service Up ou qualquer outra ferramenta de chamados.

O front-end chama sempre a API própria. Se o sistema de chamados mudar no futuro, a alteração fica concentrada no backend/provider.

```text
frontend → chamadoService → API própria → provider atual
```

Providers futuros:

```text
providers/
├── mockProvider
├── znunyProvider
├── serviceUpProvider
└── novoSistemaProvider
```

## Busca global

A busca não deve funcionar como o Znuny, onde o usuário precisa escolher exatamente o campo.

A busca deve procurar em múltiplos campos ao mesmo tempo:

- número do chamado;
- título;
- descrição;
- histórico;
- solicitante;
- e-mail;
- máquina;
- serial;
- patrimônio;
- empresa;
- fila;
- status;
- responsável;
- nota fiscal.

## Ativos

O módulo de ativos deve permitir:

- pesquisar ativo;
- criar ativo;
- editar ativo;
- excluir ativo;
- clonar ativo;
- criar ativos em lote;
- sugerir próximo número por prefixo.

Exemplo:

```text
Prefixo: NOTEGEO
Último encontrado: NOTEGEO659
Próximo sugerido: NOTEGEO660
Quantidade: 5
Gerar:
- NOTEGEO660
- NOTEGEO661
- NOTEGEO662
- NOTEGEO663
- NOTEGEO664
```

## Segurança futura

A aplicação deve ser preparada para Microsoft Entra ID:

```text
Usuário loga com SSO
        ↓
Front-end envia token/sessão para API
        ↓
API valida usuário e grupos
        ↓
API aplica permissões
        ↓
API consulta banco/sistemas externos
```

Não enviar senha do usuário para API.
Não colocar credenciais no front-end.
