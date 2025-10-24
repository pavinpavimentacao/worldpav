# Scripts do Projeto WorldPav

Esta pasta contém todos os scripts de automação, manutenção e utilitários do projeto.

## Estrutura de Pastas

### 📁 `/database` - Scripts de Banco de Dados
Scripts relacionados ao banco de dados PostgreSQL/Supabase:

- **Migrações SQL**: Scripts de criação e alteração de tabelas
- **Correções de Dados**: Scripts para corrigir dados inconsistentes
- **Verificações**: Scripts para verificar integridade dos dados
- **Aplicação de Migrações**: Scripts .bat para aplicar migrações

**Arquivos principais:**
- `corrigir-estrutura-notas.sql` - Correção da estrutura de notas fiscais
- `criar-tabela-pagamentos-diretos.sql` - Criação da tabela de pagamentos
- `aplicar-migracao-*.bat` - Scripts para aplicar migrações
- `verificar-*.sql` - Scripts de verificação

### 📁 `/maintenance` - Scripts de Manutenção
Scripts para manutenção e operações do sistema:

- **Backup**: Scripts de backup de dados
- **Limpeza**: Scripts de limpeza de arquivos temporários
- **Inicialização**: Scripts de inicialização do servidor
- **Configuração**: Scripts de configuração do ambiente

**Arquivos principais:**
- `iniciar-servidor.bat` - Inicialização do servidor de desenvolvimento
- `setup-and-run.bat` - Setup completo do projeto
- `teste-ambiente.bat` - Teste do ambiente

### 📁 `/utilities` - Scripts Utilitários
Scripts utilitários para desenvolvimento e automação:

- **Python Scripts**: Scripts de processamento e automação
- **JavaScript/Node.js**: Scripts de build e desenvolvimento
- **Shell Scripts**: Scripts de automação Unix/Linux
- **Correção de Imports**: Scripts para corrigir imports

**Arquivos principais:**
- `corrigir-todos-imports.py` - Correção automática de imports
- `fix-imports-systematic.py` - Correção sistemática de imports
- `remove-bombas-*.py` - Remoção de caracteres especiais
- `test-database.js` - Teste de conexão com banco

### 📁 `/debug` - Scripts de Debug
Scripts para debug e diagnóstico:

- **Diagnóstico**: Scripts para diagnosticar problemas
- **Verificação**: Scripts para verificar configurações
- **Testes**: Scripts de teste específicos

### 📁 `/deployment` - Scripts de Deploy
Scripts para deploy e produção:

- **Edge Functions**: Deploy de funções serverless
- **Configuração**: Scripts de configuração de produção

### 📁 `/setup` - Scripts de Configuração
Scripts para configuração inicial:

- **VAPID Keys**: Geração de chaves para notificações
- **Storage**: Configuração de buckets do Supabase
- **Usuários**: Scripts de registro de usuários

### 📁 `/testing` - Scripts de Teste
Scripts para testes automatizados:

- **Testes de API**: Testes de endpoints
- **Testes de PDF**: Geração e teste de PDFs
- **Testes de Notificação**: Testes de sistema de notificações

## Como Usar

### Scripts de Banco de Dados
```bash
# Aplicar migração
scripts/database/aplicar-migracao-financeiro.bat

# Verificar dados
scripts/database/verificar-tabelas-supabase.sql
```

### Scripts de Manutenção
```bash
# Iniciar servidor
scripts/maintenance/iniciar-servidor.bat

# Setup completo
scripts/maintenance/setup-and-run.bat
```

### Scripts Utilitários
```bash
# Corrigir imports
python scripts/utilities/corrigir-todos-imports.py

# Testar banco
node scripts/utilities/test-database.js
```

## Convenções

### Nomenclatura de Arquivos
- **SQL**: `[acao]-[tabela].sql` (ex: `criar-tabela-obras.sql`)
- **Batch**: `[acao]-[modulo].bat` (ex: `aplicar-migracao-financeiro.bat`)
- **Python**: `[acao]-[descricao].py` (ex: `corrigir-todos-imports.py`)
- **JavaScript**: `[acao]-[modulo].js` (ex: `test-database.js`)

### Estrutura de Scripts
- **Comentários**: Todos os scripts devem ter comentários explicativos
- **Logs**: Scripts devem exibir logs de progresso
- **Tratamento de Erro**: Scripts devem tratar erros adequadamente
- **Documentação**: Scripts complexos devem ter documentação

## Dependências

### Python Scripts
- `python 3.8+`
- `pandas` (para processamento de dados)
- `os`, `re` (bibliotecas padrão)

### Node.js Scripts
- `node 16+`
- `@supabase/supabase-js`
- `dotenv`

### Batch Scripts
- Windows 10+
- Node.js instalado
- Variáveis de ambiente configuradas

## Troubleshooting

### Problemas Comuns
1. **Erro de conexão com banco**: Verificar variáveis de ambiente
2. **Script não executa**: Verificar permissões e dependências
3. **Erro de sintaxe**: Verificar versão do Python/Node.js

### Logs
- Scripts Python: Logs no console
- Scripts Node.js: Logs no console
- Scripts Batch: Logs em arquivos .log

---

*Última atualização: 24/10/2025*
