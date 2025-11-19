# 📊 RELATÓRIO DE ANÁLISE COMPLETA - SUPABASE STORAGE

**Data da Análise:** 02/11/2025  
**Projeto:** Worldpav - Sistema de Gestão de Obras

---

## 🎯 OBJETIVO DA ANÁLISE

Analisar todos os locais no projeto onde há upload de arquivos, verificar a configuração dos buckets do Supabase Storage e identificar inconsistências entre o código e a infraestrutura.

---

## 📦 BUCKETS CONFIGURADOS NAS MIGRATIONS

### ✅ Migration: `15_storage_setup.sql`
| Bucket | Público | Limite | Tipos Permitidos |
|--------|---------|--------|------------------|
| `colaboradores-documents` | ❌ Não | - | PDF, Imagens, ZIP |
| `colaboradores-photos` | ❌ Não | - | Imagens |
| `maquinarios-photos` | ❌ Não | - | Imagens |
| `maquinarios-documents` | ❌ Não | - | PDF, Imagens |
| `obras-photos` | ❌ Não | - | Imagens |
| `notas-fiscais` | ❌ Não | - | PDF |
| `relatorios-photos` | ❌ Não | - | Imagens |
| `contas-pagar-documents` | ❌ Não | - | PDF, Imagens |
| `general-uploads` | ❌ Não | - | Todos |

### ✅ Migration: `20_setup_storage_bucket.sql`
| Bucket | Público | Limite | Tipos Permitidos |
|--------|---------|--------|------------------|
| `documents` | ❌ Não | 10MB | PDF, Word, TXT, Imagens |

### ✅ Migration: `criar_buckets_obras.sql`
| Bucket | Público | Limite | Tipos Permitidos |
|--------|---------|--------|------------------|
| `obras-notas-fiscais` | ✅ Sim | 10MB | PDF |
| `obras-medicoes` | ✅ Sim | 10MB | PDF, Excel (.xlsx, .xls) |
| `obras-comprovantes` | ✅ Sim | 10MB | PDF, JPEG, PNG |

### ✅ Migration: `criar_bucket_contratos_documentacao.sql`
| Bucket | Público | Limite | Tipos Permitidos |
|--------|---------|--------|------------------|
| `contratos-documentacao` | ✅ Sim | 10MB | PDF, JPEG, PNG |

---

## 🔍 ANÁLISE DO CÓDIGO - LOCAIS COM UPLOAD

### ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

#### 1. **Bucket "attachments" não existe**

Os seguintes arquivos tentam fazer upload para um bucket chamado `attachments` que **NÃO ESTÁ CONFIGURADO** em nenhuma migration:

| Arquivo | Linha | Bucket Usado | Deveria Usar |
|---------|-------|--------------|--------------|
| `NotaFiscalForm.tsx` | 91, 99 | `attachments` | `obras-notas-fiscais` |
| `NotaFiscalFormSimple.tsx` | 116, 125 | `attachments` | `obras-notas-fiscais` |
| `ContaPagarForm.tsx` | 266, 274 | `attachments` | `obras-comprovantes` ou `contas-pagar-documents` |

**Impacto:** ❌ **UPLOADS FALHARÃO** - O bucket não existe!

---

#### 2. **Função com parâmetros incorretos**

**Arquivo:** `AdicionarPagamentoDiretoModal.tsx` (linha 86)

```typescript
// ❌ ERRADO - Falta o 3º parâmetro
const url = await uploadToSupabaseStorage(file, 'obras-pagamentos-diretos')

// ✅ CORRETO - Precisa de 3 parâmetros
const { url, error } = await uploadToSupabaseStorage(
  file,
  'obras-pagamentos-diretos', 
  obraId  // ← FALTA ESTE PARÂMETRO
)
```

**Impacto:** ❌ **ERRO DE EXECUÇÃO** - Função espera 3 parâmetros!

---

#### 3. **Bucket não documentado**

O bucket `obras-pagamentos-diretos` é usado no código mas **NÃO ESTÁ** nas migrations SQL.

**Recomendação:** Usar `obras-comprovantes` ao invés de criar um novo bucket.

---

### ✅ ARQUIVOS CORRETOS

| Arquivo | Bucket | Status |
|---------|--------|--------|
| `AdicionarNotaFiscalModal.tsx` | `obras-notas-fiscais` | ✅ OK |
| `EditarNotaFiscalModal.tsx` | `obras-notas-fiscais` | ✅ OK |
| `AdicionarMedicaoModal.tsx` | `obras-medicoes` | ✅ OK |
| `NovoContratoModal.tsx` | `contratos-documentacao` | ✅ OK |
| `NovaDocumentacaoModal.tsx` | `contratos-documentacao` | ✅ OK |
| `FileUpload.tsx` | `documents` | ✅ OK |
| `colaborador-storage.ts` | `colaboradores-documents` | ✅ OK |

---

## 📋 TABELA RESUMO DE TODOS OS UPLOADS

| Componente/Serviço | Bucket Usado | Correto? | Observações |
|--------------------|--------------|----------|-------------|
| `NotaFiscalForm.tsx` | `attachments` | ❌ | Bucket não existe |
| `NotaFiscalFormSimple.tsx` | `attachments` | ❌ | Bucket não existe |
| `ContaPagarForm.tsx` | `attachments` | ❌ | Bucket não existe |
| `AdicionarNotaFiscalModal.tsx` | `obras-notas-fiscais` | ✅ | - |
| `EditarNotaFiscalModal.tsx` | `obras-notas-fiscais` | ✅ | - |
| `AdicionarMedicaoModal.tsx` | `obras-medicoes` | ✅ | - |
| `AdicionarPagamentoDiretoModal.tsx` | `obras-pagamentos-diretos` | ⚠️ | Falta 3º parâmetro + bucket não configurado |
| `NovoContratoModal.tsx` | `contratos-documentacao` | ✅ | - |
| `EditarContratoModal.tsx` | `contratos-documentacao` | ✅ | - |
| `NovaDocumentacaoModal.tsx` | `contratos-documentacao` | ✅ | - |
| `FileUpload.tsx` | `documents` | ✅ | - |
| `DocumentoForm.tsx` | (interno) | ✅ | Usa função de storage interno |
| `colaborador-storage.ts` | `colaboradores-documents` | ✅ | - |
| Componentes de colaboradores | `colaboradores-documents` | ✅ | Via serviço |

---

## 🔴 PROBLEMAS IDENTIFICADOS

### Problema 1: Bucket "attachments" não existe
**Severidade:** 🔴 CRÍTICO  
**Arquivos afetados:** 3  
**Solução:** Substituir `attachments` pelo bucket correto

### Problema 2: Parâmetros incorretos na função
**Severidade:** 🔴 CRÍTICO  
**Arquivos afetados:** 1  
**Solução:** Adicionar o 3º parâmetro `path`

### Problema 3: Bucket não configurado nas migrations
**Severidade:** 🟡 MÉDIO  
**Buckets afetados:** `obras-pagamentos-diretos`  
**Solução:** Usar bucket existente ou criar migration

---

## 💡 RECOMENDAÇÕES

### Imediatas (Críticas)

1. **Corrigir `NotaFiscalForm.tsx` e `NotaFiscalFormSimple.tsx`**
   - Substituir `attachments` por `obras-notas-fiscais`
   
2. **Corrigir `ContaPagarForm.tsx`**
   - Substituir `attachments` por `obras-comprovantes`
   
3. **Corrigir `AdicionarPagamentoDiretoModal.tsx`**
   - Adicionar 3º parâmetro na função
   - Usar `obras-comprovantes` ao invés de `obras-pagamentos-diretos`

### Longo Prazo

4. **Padronizar nomenclatura de buckets**
   - Decisão: Unificar `notas-fiscais` e `obras-notas-fiscais`?
   - Decisão: Unificar `contas-pagar-documents` e `obras-comprovantes`?

5. **Documentar política de buckets**
   - Criar documento com regras de uso
   - Definir quando criar público vs privado

6. **Criar testes automatizados**
   - Validar que buckets existem antes de deploy
   - Testar upload em cada bucket

---

## 🛠️ PRÓXIMOS PASSOS

1. ✅ Executar script de diagnóstico: `node scripts/diagnostico-storage.js`
2. ⏳ Verificar buckets no Supabase Dashboard
3. ⏳ Corrigir arquivos TypeScript com problemas
4. ⏳ Testar uploads em ambiente de desenvolvimento
5. ⏳ Deploy das correções

---

## 📝 NOTAS TÉCNICAS

### Função `uploadToSupabaseStorage`

**Localização:** `src/utils/file-upload-utils.ts`

**Assinatura:**
```typescript
async function uploadToSupabaseStorage(
  file: File,
  bucket: string,
  path: string  // ← Usado como prefixo do nome do arquivo
): Promise<{ url: string | null; error: string | null }>
```

**Geração do nome do arquivo:**
```typescript
const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
```

**Exemplo:**
- `path = "obra-123"`
- Resultado: `obra-123/1730574234567-abc123.pdf`

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Todos os buckets necessários estão criados no Supabase
- [ ] Todas as políticas RLS estão configuradas
- [ ] Todos os arquivos TypeScript usam buckets corretos
- [ ] Todas as funções têm os parâmetros corretos
- [ ] Upload de nota fiscal funciona
- [ ] Upload de medição funciona
- [ ] Upload de comprovante funciona
- [ ] Upload de contrato funciona
- [ ] Upload de documentação funciona
- [ ] Upload de documentos de colaboradores funciona

---

**Gerado automaticamente pelo sistema de diagnóstico Worldpav**





