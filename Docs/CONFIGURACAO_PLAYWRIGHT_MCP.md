# 🎭 Configuração do Playwright MCP

## 📋 O que é o Playwright MCP?

O **MCP (Model Context Protocol)** do Playwright permite que a IA (Claude/Cursor) automatize interações com o navegador, execute testes e capture screenshots do seu sistema.

---

## ✅ Status Atual

### Arquivo de Configuração
Seu arquivo `.cursor/mcp.json` já está configurado:

```json
{
  "mcpServers": {
    "Playwright": {
      "command": "npx @playwright/mcp@latest"
    }
  }
}
```

✅ **Configuração correta!**

---

## 🔧 Pendências e Instalação

### 1. Instalar Playwright (Recomendado)

Embora o MCP use `npx` para baixar automaticamente, é recomendado instalar o Playwright no projeto:

```bash
# Na raiz do projeto (c:\Users\PC\worldpav)
npm install -D @playwright/test
npx playwright install
```

**O que isso faz:**
- Instala o Playwright como dependência de desenvolvimento
- Baixa os navegadores necessários (Chromium, Firefox, WebKit)
- Tempo estimado: 2-3 minutos

---

### 2. Configurar Playwright (Opcional mas Recomendado)

Criar arquivo `playwright.config.ts` na raiz:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### 3. Criar Pasta de Testes (Opcional)

```bash
mkdir tests
```

Exemplo de teste (`tests/exemplo.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('deve abrir a página inicial', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/WorldPav/);
});

test('deve fazer login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'usuario@exemplo.com');
  await page.fill('input[type="password"]', 'senha123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/dashboard/);
});
```

---

## 🚀 Como Usar o MCP do Playwright

### Após instalado, você pode pedir para a IA:

#### Exemplos de Comandos:

1. **"Tire um screenshot da página inicial"**
   - A IA vai abrir o navegador
   - Navegar para localhost:5173
   - Tirar screenshot
   - Retornar a imagem

2. **"Teste se o login funciona"**
   - A IA vai criar um teste automatizado
   - Executar no navegador
   - Retornar os resultados

3. **"Verifique se todas as páginas carregam sem erro"**
   - A IA vai navegar por todas as rotas
   - Verificar erros no console
   - Gerar relatório

4. **"Capture o fluxo de criar uma nota fiscal"**
   - A IA vai simular o usuário
   - Clicar nos botões
   - Preencher formulários
   - Documentar o processo

---

## ✅ Checklist de Instalação

Execute estes comandos em sequência:

```bash
# 1. Instalar Playwright
npm install -D @playwright/test

# 2. Instalar navegadores
npx playwright install

# 3. Verificar instalação
npx playwright --version

# 4. Criar pasta de testes (opcional)
mkdir tests

# 5. Rodar teste de exemplo (após criar playwright.config.ts)
npx playwright test --ui
```

---

## 🧪 Testando o MCP

### Passo 1: Certifique-se que o projeto está rodando

```bash
npm run dev
```

Aguarde até ver:
```
VITE v5.4.11  ready in 234 ms
➜  Local:   http://localhost:5173/
```

### Passo 2: Pergunte à IA no Cursor

**Experimente perguntar:**

```
"Use o Playwright MCP para tirar um screenshot da página inicial do WorldPav"
```

ou

```
"Teste se consigo navegar até a página de Obras"
```

---

## 🐛 Troubleshooting

### Erro: "Playwright executable not found"

**Solução:**
```bash
npx playwright install
```

### Erro: "Cannot find module @playwright/test"

**Solução:**
```bash
npm install -D @playwright/test
```

### Erro: "Port 5173 is not available"

**Solução:** Certifique-se que o servidor Vite está rodando:
```bash
npm run dev
```

### MCP não responde no Cursor

**Soluções:**
1. Reinicie o Cursor completamente
2. Verifique se o Node.js está no PATH
3. Execute `npx @playwright/mcp@latest --version` manualmente
4. Verifique os logs do Cursor (Help → Show Logs)

---

## 📊 Comandos Úteis

```bash
# Ver versão do Playwright
npx playwright --version

# Abrir UI do Playwright
npx playwright test --ui

# Executar testes
npx playwright test

# Gerar relatório HTML
npx playwright show-report

# Modo debug
npx playwright test --debug

# Executar teste específico
npx playwright test tests/exemplo.spec.ts
```

---

## 🎯 Próximos Passos

### Após instalação:

1. ✅ Execute `npm install -D @playwright/test`
2. ✅ Execute `npx playwright install`
3. ✅ Inicie o servidor: `npm run dev`
4. ✅ Reinicie o Cursor
5. ✅ Teste perguntando à IA: "Tire um screenshot da página inicial"

---

## 📚 Recursos Adicionais

- [Documentação Playwright](https://playwright.dev/)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright)
- [Cursor MCP Docs](https://docs.cursor.com/mcp)

---

## ✨ Benefícios do MCP do Playwright

✅ **Automação de Testes**: A IA cria e executa testes automaticamente
✅ **Screenshots**: Capture qualquer estado da aplicação
✅ **Debug Visual**: Veja exatamente o que o usuário vê
✅ **Testes E2E**: Teste fluxos completos automaticamente
✅ **Documentação**: Gere documentação visual automaticamente
✅ **Validação**: Verifique se mudanças não quebraram nada

---

**Data:** 23/10/2024
**Status:** 🟡 Configuração pendente (mas simples!)
**Tempo estimado:** 5 minutos



