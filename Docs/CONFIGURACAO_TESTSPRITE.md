# 🧪 Configuração e Uso do TestSprite MCP

## ✅ Status Atual

**TestSprite MCP está 100% funcional!**

- ✅ **Pacote instalado**: `@testsprite/testsprite-mcp@0.0.17`
- ✅ **Versão do plugin**: `1.0.0`
- ✅ **Servidor rodando**: `http://localhost:5173`
- ✅ **API Key configurada**: Presente no `mcp.json`
- ✅ **MCP carregado**: Ferramentas disponíveis no Cursor

---

## 📦 Instalação Completa

### Dependências Instaladas
```json
{
  "devDependencies": {
    "@testsprite/testsprite-mcp": "^0.0.17",
    "@playwright/test": "^1.56.1",
    "@playwright/mcp": "^0.0.43"
  }
}
```

### Configuração MCP
Arquivo: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx @testsprite/testsprite-mcp@latest",
      "env": {
        "API_KEY": "sk-user-MA2o3KnN4CemBbrUIYUFjhsgLNf-IDDUBlgBSeyc309Iym2IFKe12R1WEIE5gNvV-mo309pLbDiGXa-yKoN8SlkkgcxqXfwXwObePaxw_6pI5AplHIBdHwdDXj9F5ZF9HeY"
      },
      "args": []
    }
  }
}
```

---

## 🚀 Ferramentas Disponíveis

O TestSprite MCP oferece 7 ferramentas principais:

### 1. **Bootstrap Tests** 🏗️
Inicializa o ambiente de testes do TestSprite.

**Quando usar:** Primeira vez que for testar ou quando iniciar nova sessão de testes.

**Parâmetros:**
- `localPort`: Porta do servidor (padrão: 5173)
- `pathname`: Caminho da página a testar
- `projectPath`: Caminho absoluto do projeto
- `testScope`: `codebase` (todo código) ou `diff` (apenas mudanças)
- `type`: `frontend` ou `backend`

**Exemplo de uso:**
```
"Inicialize o TestSprite para testes frontend na porta 5173"
```

---

### 2. **Generate Code Summary** 📝
Analisa e sumariza o código do projeto.

**Quando usar:** Para entender a estrutura do projeto antes de criar testes.

**Parâmetros:**
- `projectRootPath`: Caminho absoluto do projeto

**Exemplo de uso:**
```
"Gere um resumo do código do projeto WorldPav"
```

---

### 3. **Generate Standardized PRD** 📋
Cria um PRD (Product Requirements Document) padronizado.

**Quando usar:** Documentar funcionalidades antes de testar.

**Parâmetros:**
- `projectPath`: Caminho absoluto do projeto

**Exemplo de uso:**
```
"Crie um PRD padronizado para o projeto"
```

---

### 4. **Generate Frontend Test Plan** 🎨
Gera plano de testes para frontend.

**Quando usar:** Criar estratégia de testes de interface.

**Parâmetros:**
- `projectPath`: Caminho absoluto do projeto
- `needLogin`: Se deve incluir testes de login (true/false)

**Exemplo de uso:**
```
"Gere um plano de testes frontend incluindo login"
```

---

### 5. **Generate Backend Test Plan** ⚙️
Gera plano de testes para backend.

**Quando usar:** Criar testes de API e lógica de negócio.

**Parâmetros:**
- `projectPath`: Caminho absoluto do projeto

**Exemplo de uso:**
```
"Crie um plano de testes para o backend"
```

---

### 6. **Generate Code and Execute** 🚀
Gera e executa os testes automaticamente.

**Quando usar:** Executar os testes planejados.

**Parâmetros:**
- `projectName`: Nome do projeto
- `projectPath`: Caminho absoluto do projeto
- `testIds`: IDs específicos de testes (array vazio = todos)
- `additionalInstruction`: Instruções adicionais (string vazia se não houver)

**Exemplo de uso:**
```
"Execute todos os testes do projeto WorldPav"
```

---

### 7. **Rerun Tests** 🔄
Re-executa os testes manualmente.

**Quando usar:** Rodar novamente os mesmos testes.

**Parâmetros:**
- `projectPath`: Caminho absoluto do projeto

**Exemplo de uso:**
```
"Re-execute os testes do projeto"
```

---

## 📖 Fluxo de Trabalho Completo

### Passo 1: Inicializar o TestSprite
```
"Inicialize o TestSprite para testes frontend no projeto WorldPav"
```

### Passo 2: Gerar Resumo do Código
```
"Gere um resumo do código do projeto"
```

### Passo 3: Criar Plano de Testes
```
"Gere um plano de testes frontend incluindo login"
```

### Passo 4: Executar Testes
```
"Execute todos os testes planejados"
```

### Passo 5: Analisar Resultados
O TestSprite vai:
- ✅ Gerar código de testes
- ✅ Executar os testes
- ✅ Capturar screenshots
- ✅ Gerar relatório markdown
- ✅ Salvar resultados

---

## 🎯 Exemplos Práticos

### Teste Completo de Login
```
"Use o TestSprite para:
1. Inicializar testes frontend
2. Criar plano de testes de login
3. Executar os testes
4. Gerar relatório"
```

### Teste de Módulo Específico
```
"Teste o módulo de Obras com TestSprite:
- Criar obra
- Editar obra
- Listar obras
- Excluir obra"
```

### Teste de API (Backend)
```
"Gere e execute testes backend para:
- Endpoints de autenticação
- CRUD de clientes
- Relatórios financeiros"
```

---

## 📂 Estrutura de Arquivos

```
worldpav/
├── testsprite_tests/           # Pasta de testes
│   └── tmp/
│       ├── config.json         # Configuração do TestSprite
│       └── prd_files/          # PRDs gerados
├── package.json                # Dependências (inclui TestSprite)
└── Docs/
    └── CONFIGURACAO_TESTSPRITE.md  # Esta documentação
```

---

## 🔧 Configuração Atual

### Servidor Local
- **URL**: `http://localhost:5173/`
- **Porta**: `5173`
- **Status**: ✅ Rodando (PIDs: 10022, 13199, 14620)

### TestSprite Config
```json
{
  "status": "init",
  "scope": "codebase",
  "type": "frontend",
  "localEndpoint": "http://localhost:5173/",
  "serverPort": 57544
}
```

---

## 💡 Dicas de Uso

### 1. Sempre Inicialize Primeiro
```
"Bootstrap do TestSprite para frontend no WorldPav"
```

### 2. Use Linguagem Natural
O TestSprite entende comandos em português:
```
"Teste se consigo criar uma nova obra e adicionar ruas"
```

### 3. Seja Específico
```
❌ "Teste tudo"
✅ "Teste o fluxo de criar obra, adicionar 3 ruas e gerar relatório"
```

### 4. Verifique o Servidor
Antes de testar, confirme que o servidor está rodando:
```bash
npm run dev
```

---

## 🐛 Troubleshooting

### Erro: "TestSprite not initialized"
**Solução:**
```
"Inicialize o TestSprite para testes frontend"
```

### Erro: "Port 5173 not available"
**Solução:** Inicie o servidor:
```bash
npm run dev
```

### Erro: "API Key invalid"
**Solução:** Verifique `~/.cursor/mcp.json` - a chave deve estar presente.

### MCP não responde
**Solução:**
1. Reinicie o Cursor completamente
2. Verifique instalação: `npx @testsprite/testsprite-mcp --version`
3. Reinstale se necessário: `npm install -D @testsprite/testsprite-mcp`

---

## 📊 Comandos Úteis

```bash
# Verificar versão do TestSprite
npx @testsprite/testsprite-mcp --version

# Reinstalar TestSprite
npm install -D @testsprite/testsprite-mcp

# Iniciar servidor de desenvolvimento
npm run dev

# Verificar se porta está em uso
lsof -ti:5173

# Verificar logs do TestSprite
# (Os logs aparecem no terminal do Cursor)
```

---

## 🎨 Tipos de Testes Suportados

### Frontend ✅
- Testes de UI/UX
- Testes de navegação
- Testes de formulários
- Testes de fluxo de usuário
- Testes visuais (screenshots)

### Backend ✅
- Testes de API
- Testes de endpoints
- Testes de CRUD
- Testes de autenticação
- Testes de lógica de negócio

### Integração ✅
- Testes E2E (End-to-End)
- Testes de fluxos completos
- Testes de integração com banco de dados
- Testes de autenticação completa

---

## 📚 Recursos Adicionais

- [TestSprite Documentation](https://www.testsprite.com)
- [TestSprite NPM Package](https://www.npmjs.com/package/@testsprite/testsprite-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)

---

## ✅ Checklist de Verificação

Antes de usar o TestSprite, confirme:

- [x] Pacote instalado (`@testsprite/testsprite-mcp@0.0.17`)
- [x] API Key configurada no `mcp.json`
- [x] Servidor rodando (`http://localhost:5173`)
- [x] Cursor reiniciado (se acabou de instalar)
- [x] Pasta `testsprite_tests/` existe

---

## 🎯 Próximos Passos

### Agora você pode:

1. ✅ **Criar testes automatizados** com comandos em linguagem natural
2. ✅ **Executar testes E2E** sem escrever código
3. ✅ **Gerar relatórios** automáticos com screenshots
4. ✅ **Validar funcionalidades** antes de commits
5. ✅ **Documentar fluxos** visualmente

---

**Data de instalação:** 02/11/2025  
**Versão TestSprite:** 0.0.17  
**Status:** ✅ 100% Funcional  
**Projeto:** WorldPav - Sistema de Gestão de Pavimentação

---

## 🚀 Comece Agora!

**Experimente:**
```
"Use o TestSprite para criar e executar testes do módulo de Obras"
```

Ou

```
"Inicialize o TestSprite e gere um plano completo de testes frontend"
```

---

✨ **O TestSprite está pronto para automatizar seus testes!**



