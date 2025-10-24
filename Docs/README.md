# Documentação WorldPav

Bem-vindo à documentação do projeto WorldPav, um sistema completo de gestão de obras de pavimentação.

## 📚 Índice da Documentação

### 🏗️ Arquitetura
- [**Arquitetura do Sistema**](./ARCHITECTURE.md) - Visão geral da arquitetura e organização do projeto
- [**Estrutura do Projeto**](./ESTRUTURA_PROJETO.md) - Estrutura detalhada de diretórios e arquivos

### 🗄️ Banco de Dados
- [**Configuração do Supabase**](./database/COMO_CONFIGURAR_SUPABASE.md) - Guia de configuração do Supabase
- [**Instruções RLS**](./database/INSTRUCOES_RLS.md) - Configuração de Row Level Security
- [**Storage de Colaboradores**](./database/INSTRUCOES_STORAGE_COLABORADORES.md) - Configuração de storage
- [**Aplicar Migração Manual**](./database/APLICAR_MIGRACAO_MANUAL.md) - Guia de migração manual
- [**Verificar Banco de Dados**](./database/VERIFICAR_BANCO_DADOS.md) - Scripts de verificação

### 🚀 Deploy e Produção
- [**Guia de Deploy**](./deployment/DEPLOY_GUIDE.md) - Guia completo de deploy
- [**Deploy Manual**](./deployment/DEPLOY_MANUAL.md) - Instruções de deploy manual
- [**Configuração Vercel**](./deployment/VERCEL_SETUP.md) - Setup no Vercel
- [**Configuração Netlify**](./deployment/DEPLOY_INSTRUCTIONS.md) - Setup no Netlify

### 🛠️ Desenvolvimento
- [**Guia Rápido**](./development/GUIA_RAPIDO.md) - Início rápido para desenvolvedores
- [**Getting Started**](./development/GETTING_STARTED.md) - Primeiros passos
- [**Configuração de Variáveis**](./development/CONFIGURACAO_VARIAVEIS_AMBIENTE.md) - Configuração de ambiente
- [**Configuração Playwright MCP**](./development/CONFIGURACAO_PLAYWRIGHT_MCP.md) - Setup de testes
- [**Pendências MCP**](./development/PENDENCIAS_MCP.md) - Lista de pendências

### ✨ Funcionalidades
- [**Implementação de Clientes**](./features/CLIENTES_IMPLEMENTACAO_COMPLETA.md) - Módulo de clientes
- [**Módulo de Colaboradores**](./features/COLABORADORES_MODULE_DOCUMENTATION.md) - Gestão de colaboradores
- [**Módulo Financeiro**](./features/FINANCIAL_MODULE_DOCUMENTATION.md) - Sistema financeiro
- [**Módulo de Notas**](./features/NOTES_MODULE_DOCUMENTATION.md) - Gestão de notas fiscais
- [**Módulo de Programação**](./features/PROGRAMACAO_MODULE_DOCUMENTATION.md) - Programação de obras
- [**Sistema de Relatórios**](./features/REPORTS_DOCUMENTATION.md) - Geração de relatórios
- [**Sistema de Guardas**](./features/SISTEMA_GUARDAS.md) - Sistema de permissões

### 🔧 Resolução de Problemas
- [**Troubleshooting Geral**](./troubleshooting/TROUBLESHOOTING.md) - Guia geral de resolução
- [**Análise de Situação**](./troubleshooting/ANALISE_SITUACAO.md) - Análise de problemas
- [**Correção de Cache**](./troubleshooting/CACHE_FIX.md) - Problemas de cache
- [**Correção de Erros**](./troubleshooting/PROBLEMA_RESOLVIDO.md) - Correções implementadas
- [**Motivo do Erro**](./troubleshooting/MOTIVO_DO_ERRO.md) - Análise de causas

### 📊 Relatórios e Status
- [**Status do Projeto**](./STATUS.md) - Status atual do desenvolvimento
- [**Status Final**](./FINAL_STATUS.md) - Status final do projeto
- [**Changelog**](./changelog/) - Histórico de mudanças
- [**Relatório de Migração**](./CALENDAR_MIGRATION_REPORT.md) - Relatório de migração

## 🚀 Início Rápido

### Para Desenvolvedores
1. Leia o [Guia Rápido](./development/GUIA_RAPIDO.md)
2. Configure o [ambiente de desenvolvimento](./development/CONFIGURACAO_VARIAVEIS_AMBIENTE.md)
3. Consulte a [arquitetura do sistema](./ARCHITECTURE.md)

### Para Deploy
1. Siga o [Guia de Deploy](./deployment/DEPLOY_GUIDE.md)
2. Configure as [variáveis de ambiente](./development/CONFIGURACAO_VARIAVEIS_AMBIENTE.md)
3. Execute os [scripts de banco de dados](../scripts/database/)

### Para Resolução de Problemas
1. Consulte o [Troubleshooting Geral](./troubleshooting/TROUBLESHOOTING.md)
2. Verifique os [logs de erro](./troubleshooting/)
3. Execute os [scripts de verificação](../scripts/database/)

## 📁 Estrutura de Documentação

```
docs/
├── README.md                    # Este arquivo
├── ARCHITECTURE.md              # Arquitetura do sistema
├── database/                    # Documentação de banco de dados
├── deployment/                  # Guias de deploy
├── development/                 # Guias de desenvolvimento
├── features/                    # Documentação de funcionalidades
├── troubleshooting/             # Resolução de problemas
├── api/                         # Documentação da API
└── changelog/                   # Histórico de mudanças
```

## 🔍 Como Navegar

### Por Categoria
- **Arquitetura**: Documentação técnica e estrutura
- **Banco de Dados**: Configuração e migrações
- **Deploy**: Instruções de produção
- **Desenvolvimento**: Guias para desenvolvedores
- **Funcionalidades**: Documentação de módulos
- **Troubleshooting**: Resolução de problemas

### Por Tipo de Usuário
- **Desenvolvedores**: Arquitetura + Desenvolvimento + Features
- **DevOps**: Deploy + Database + Troubleshooting
- **Usuários Finais**: Features + Troubleshooting
- **Manutenção**: Database + Troubleshooting

## 📝 Convenções de Documentação

### Nomenclatura de Arquivos
- **IMPLEMENTACAO_[MODULO].md** - Documentação de implementação
- **CORRECAO_[PROBLEMA].md** - Documentação de correções
- **TROUBLESHOOTING_[PROBLEMA].md** - Guias de resolução
- **SETUP_[SERVICO].md** - Guias de configuração

### Estrutura de Documentos
1. **Título** - Nome claro do documento
2. **Visão Geral** - Resumo do conteúdo
3. **Pré-requisitos** - O que é necessário
4. **Instruções** - Passo a passo
5. **Troubleshooting** - Problemas comuns
6. **Referências** - Links úteis

## 🤝 Contribuindo

### Adicionando Documentação
1. Escolha a pasta apropriada
2. Siga as convenções de nomenclatura
3. Use a estrutura padrão de documentos
4. Atualize este README se necessário

### Atualizando Documentação
1. Mantenha a consistência
2. Atualize referências cruzadas
3. Verifique se os links funcionam
4. Teste as instruções

---

*Última atualização: 24/10/2025*
*Versão da documentação: 2.0*