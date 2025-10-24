# 🔧 Como Configurar o Supabase - WorldPav

## ❗ IMPORTANTE
O projeto WorldPav precisa de uma conta no Supabase (backend) para funcionar completamente.

## 📋 Opções Disponíveis:

---

### 🎯 OPÇÃO 1: Usar Projeto Supabase Existente (Se você já tem)

Se você já tem um projeto Supabase configurado:

1. **Acesse:** https://app.supabase.com
2. **Entre no seu projeto**
3. **Vá em:** Settings → API
4. **Copie as informações:**
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

5. **Edite o arquivo `.env`** na raiz do projeto e substitua:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ....sua_chave_aqui
   ```

6. **Pronto!** Execute: `npm run dev`

---

### 🆕 OPÇÃO 2: Criar Novo Projeto Supabase (Recomendado se não tem)

1. **Criar conta Supabase:**
   - Acesse: https://supabase.com
   - Clique em "Start your project"
   - Crie conta com GitHub, Google ou Email

2. **Criar novo projeto:**
   - Clique em "New Project"
   - Nome: `worldpav` (ou o que preferir)
   - Senha do banco: Crie uma senha forte (ANOTE!)
   - Região: South America (São Paulo)
   - Clique em "Create new project"
   - **Aguarde 2-3 minutos** enquanto cria

3. **Copiar credenciais:**
   - Vá em: Settings → API
   - Copie:
     - **Project URL**
     - **anon public key**

4. **Configurar `.env`:**
   ```env
   VITE_SUPABASE_URL=https://seu-projeto-aqui.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...sua_chave_completa_aqui
   ```

5. **Criar estrutura do banco de dados:**
   - No Supabase, vá em: SQL Editor
   - Execute os scripts da pasta `db/migrations/` (em ordem)
   - Ou execute o arquivo `apply_migration.sql` (se disponível)

---

### 🧪 OPÇÃO 3: Modo Desenvolvimento (Apenas Frontend - SEM BANCO)

Se você quer apenas ver a interface do projeto funcionando (sem dados reais):

1. **Edite o arquivo:** `src/lib/supabase.ts`

2. **Comente as linhas que validam o Supabase** (linhas 9-14):
   ```typescript
   // if (!supabaseUrl || !supabaseAnonKey) {
   //   console.error('❌ ERRO: Variáveis de ambiente do Supabase não encontradas!')
   //   console.error('VITE_SUPABASE_URL:', supabaseUrl)
   //   console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'DEFINIDA' : 'NÃO DEFINIDA')
   //   throw new Error('Missing Supabase environment variables')
   // }
   ```

3. **Mantenha `.env` com valores fictícios:**
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=desenvolvimento-local
   ```

4. **Execute:** `npm run dev`

⚠️ **Atenção:** Neste modo, o projeto abrirá mas não conseguirá salvar/carregar dados reais!

---

## 🚀 Depois de Configurar:

### Iniciar o servidor:
```bash
npm run dev
```

### Acessar no navegador:
```
http://localhost:5173
```

---

## 🆘 Precisa de Ajuda?

### Erro comum 1: "Missing Supabase environment variables"
**Solução:** Configure o arquivo `.env` com credenciais válidas (Opção 1 ou 2)

### Erro comum 2: "Invalid API key"
**Solução:** Verifique se copiou a chave **anon/public** corretamente (não use a service_role key)

### Erro comum 3: Projeto abre mas não carrega dados
**Solução:** Verifique se o banco de dados foi criado (execute migrations na pasta `db/migrations/`)

---

## 📱 Supabase é GRATUITO?

✅ **SIM!** O plano gratuito do Supabase oferece:
- 500 MB de banco de dados
- 1 GB de armazenamento de arquivos
- 50.000 usuários ativos mensais
- Mais que suficiente para testes e pequenas empresas!

---

## 🔐 Segurança:

⚠️ **NUNCA compartilhe:**
- Senha do banco de dados
- `service_role` key (apenas a `anon` key no frontend)
- Arquivo `.env` em repositórios públicos

---

**🎯 Qual opção você vai escolher?**

- **Opção 1:** Se já tem Supabase configurado
- **Opção 2:** Criar novo (recomendado) - 5 minutos
- **Opção 3:** Apenas teste de interface (sem dados)

Posso te ajudar com qualquer uma! 😊





