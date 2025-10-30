# 🧪 Testes de Migração - Relatórios Diários

## 📋 Resumo

Testes criados para validar as migrações de:
- ✅ Sistema de Relatórios Diários
- ✅ Controle Diário de Diárias

## 🎯 Scripts de Teste

### 1. `test-relatorios-diarios.js`
Testa o sistema completo de relatórios diários:
- ✅ Existência de tabelas
- ✅ Colunas adicionadas em obras_ruas
- ✅ Trigger que gera número automaticamente (RD-YYYY-NNN)
- ✅ Cálculo automático de espessura
- ✅ Finalização automática de rua ao criar relatório
- ✅ View completa
- ✅ Inserção de maquinários

### 2. `test-controle-diario-diarias.js`
Testa o controle diário de diárias:
- ✅ Colunas adicionadas (status_pagamento, data_pagamento, etc)
- ✅ Valores padrão configurados
- ✅ Índices criados

### 3. `test-migracao-final.js`
Verifica se a estrutura está pronta para os testes:
- ✅ Verifica estrutura atual da tabela
- ✅ Testa inserção de registros
- ✅ Valida se migração precisa ser aplicada

### 4. `run-all-migration-tests.js`
Executa todos os testes em sequência.

## 🚀 Como Executar

### Opção 1: Teste Individual
```bash
# Teste de relatórios diários
node scripts/testing/test-relatorios-diarios.js

# Teste de controle diário
node scripts/testing/test-controle-diario-diarias.js

# Verificar migração
node scripts/testing/test-migracao-final.js
```

### Opção 2: Todos os Testes
```bash
node scripts/testing/run-all-migration-tests.js
```

## 📝 Ordem de Migração

### ⚠️ ATENÇÃO: Execute nesta ordem!

1. **Migrar estrutura existente** (se aplicável):
```sql
migrate_relatorios_diarios_to_new_structure.sql
```

2. **Aplicar migrações de controle**:
```sql
add_status_pagamento_diarias.sql
fix_controle_diario_diarias_columns.sql
```

3. **Aplicar migração de relatórios** (após correção da estrutura):
```sql
create_relatorios_diarios_completo.sql
```

## 🔍 Verificação Manual

Execute os testes e verifique:

```bash
# Verificar se estrutura está OK
node scripts/testing/test-migracao-final.js

# Se OK, executar testes completos
node scripts/testing/test-relatorios-diarios.js
node scripts/testing/test-controle-diario-diarias.js
```

## ❌ Problemas Comuns

### 1. "Could not find the 'data_inicio' column"
**Causa**: Estrutura antiga ainda no banco
**Solução**: Execute `migrate_relatorios_diarios_to_new_structure.sql`

### 2. "Tabela já existe"
**Causa**: Migração já foi aplicada parcialmente
**Solução**: Use `IF NOT EXISTS` nas migrations ou migre manualmente

### 3. "Erro ao criar relatório"
**Causa**: Colunas faltantes
**Solução**: Verifique estrutura com `test-migracao-final.js`

## 📊 Resultados Esperados

### ✅ Todos os testes devem passar:

```
✅ Tabela "relatorios_diarios" existe
✅ Tabela "relatorios_diarios_maquinarios" existe
✅ Colunas adicionadas em obras_ruas
✅ Trigger gera número automaticamente
✅ Espessura calculada corretamente
✅ Rua finalizada automaticamente
✅ View completa funcionando
✅ Inserção de maquinários OK
```

## 🎯 Próximos Passos

Após todos os testes passarem:

1. Testar via interface (MCP Playwright)
2. Validar fluxo completo de criação de relatório
3. Verificar sincronização de dados
4. Documentar uso

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs de erro
2. Confirme que as migrations foram aplicadas na ordem correta
3. Execute `test-migracao-final.js` para diagnóstico
4. Consulte documentação em `/worldpav/Docs/`


