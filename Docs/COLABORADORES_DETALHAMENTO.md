# Sistema Completo de Gestão de Colaboradores - Documentação

## Visão Geral

Sistema completo de gestão de colaboradores com suporte a documentação NR, certificados, multas e arquivos gerais. Inclui alertas visuais de vencimento e sistema de notificação por e-mail via Resend.

**Data de Implementação:** 16 de outubro de 2025  
**Versão:** 1.0

---

## 📋 Estrutura de Dados

### Tabelas Criadas

#### 1. `colaboradores_documentos_nr`
Armazena documentos NR e regulatórios obrigatórios.

**Campos:**
- `id` (UUID) - Chave primária
- `colaborador_id` (UUID) - FK para colaboradores
- `tipo_documento` (ENUM) - Tipo do documento NR
- `data_validade` (DATE) - Data de validade (obrigatória)
- `arquivo_url` (TEXT) - URL do arquivo no storage
- `created_at`, `updated_at` (TIMESTAMP)

**Tipos de Documento:**
- NR-01 (Gerenciamento de Riscos)
- NR-06 (EPIs)
- NR-11 (Transporte e Manuseio)
- NR-12 (Máquinas e Equipamentos)
- NR-18 (Construção)
- MOPI (Manual de Operação)
- ASO (Atestado de Saúde Ocupacional)
- Ficha de Registro

#### 2. `colaboradores_certificados`
Gerencia certificados e cursos dos colaboradores.

**Campos:**
- `id`, `colaborador_id`
- `nome_curso` (TEXT) - Nome do curso
- `instituicao` (TEXT) - Instituição emissora
- `data_emissao`, `data_validade` (DATE)
- `arquivo_url` (TEXT)

#### 3. `colaboradores_multas`
Histórico de multas e infrações.

**Campos:**
- `id`, `colaborador_id`
- `tipo_infracao` (TEXT)
- `descricao`, `local_infracao` (TEXT)
- `valor` (DECIMAL)
- `pontos_carteira` (INTEGER)
- `data_infracao` (TIMESTAMP)
- `data_vencimento` (DATE)
- `status` (ENUM: pago, pendente, em_recurso)
- `comprovante_url` (TEXT)

#### 4. `colaboradores_arquivos`
Arquivos gerais anexados ao colaborador.

**Campos:**
- `id`, `colaborador_id`
- `nome_arquivo` (TEXT)
- `tipo_arquivo` (TEXT)
- `tamanho` (BIGINT)
- `arquivo_url` (TEXT)

#### 5. `email_logs`
Log de e-mails enviados pelo sistema.

**Campos:**
- `id`
- `tipo_email` (TEXT)
- `destinatarios` (JSONB)
- `status` (TEXT)
- `company_id` (UUID)
- `enviado_em` (TIMESTAMP)

### Campos Adicionados à Tabela `colaboradores`

- `cnh` (TEXT) - Número da CNH
- `categoria_cnh` (ENUM) - Categoria: A, B, C, D, E, AB, AC, AD, AE
- `validade_cnh` (DATE) - Data de validade da CNH
- `data_admissao` (DATE) - Data de admissão
- `observacoes` (TEXT) - Observações gerais

---

## 🗂️ Estrutura de Arquivos

### Componentes Criados

```
src/components/colaboradores/
├── FileUpload.tsx              # Componente drag & drop reutilizável
├── DocumentCard.tsx            # Card para documentos NR
├── InformacoesGeraisTab.tsx    # Aba de informações gerais
├── DocumentacaoTab.tsx         # Aba de documentação NR
├── CertificadosTab.tsx         # Aba de certificados
├── MultasTab.tsx               # Aba de multas
└── ArquivosTab.tsx             # Aba de arquivos gerais
```

### Páginas

```
src/pages/colaboradores/
├── index.tsx                   # Rotas
├── ColaboradoresList.tsx       # Lista (atualizada)
├── NovoColaborador.tsx         # Cadastro rápido
└── ColaboradorDetalhes.tsx     # Página completa com abas
```

### Serviços e Utilitários

```
src/services/
└── colaborador-storage.ts      # Gerenciamento de uploads

src/utils/
└── documento-status.ts         # Cálculo de status e validações
```

### Types

```
src/types/colaboradores.ts      # Atualizado com novos tipos
```

---

## 🔐 Supabase Storage

### Bucket: `colaboradores-documentos`

**Configuração:**
- Privado (não público)
- Tamanho máximo por arquivo: 10MB
- Tipos permitidos: PDF, PNG, JPG, JPEG, ZIP

**Estrutura de Pastas:**
```
colaboradores-documentos/
└── {colaborador_id}/
    ├── documentos-nr/
    ├── certificados/
    ├── multas/
    ├── arquivos-gerais/
    └── documentos-pessoais/
```

**Políticas RLS:**
- Usuários podem acessar apenas arquivos de colaboradores da sua empresa
- Baseado em `company_id` via `colaboradores` table

---

## 🎨 Interface do Usuário

### Página de Detalhes do Colaborador

**URL:** `/colaboradores/:id`

**Estrutura:**
1. **Header** - Nome, breadcrumb, botão voltar
2. **Tabs Horizontais** - Navegação entre seções
3. **Conteúdo da Aba Ativa**
4. **Indicador de Auto-save** - Mostra quando está salvando

### Abas Disponíveis

#### 1️⃣ Informações Gerais
- Dados pessoais (nome, CPF, telefone, email)
- Dados profissionais (equipe, função, contrato)
- CNH (número, categoria, validade)
- Observações
- Upload de documentos pessoais

**Funcionalidade:** Auto-save com debounce de 500ms

#### 2️⃣ Documentação NR
- Grid de 8 cards de documentos obrigatórios
- Status visual: ✓ Válido / ⚠ Vence em 30 dias / ✗ Vencido
- Upload com data de validade obrigatória
- Estatísticas de documentação

#### 3️⃣ Certificados
- Lista de certificados em tabela
- Modal para adicionar/editar
- Campos: curso, instituição, emissão, validade, arquivo

#### 4️⃣ Multas
- Histórico de multas em tabela
- Modal para adicionar/editar
- Campos: infração, valor, pontos, data, local, status
- Totalizadores: valor pendente e pontos acumulados

#### 5️⃣ Arquivos Gerais
- Upload drag & drop
- Lista de arquivos com ícone, nome, tamanho, data
- Ações: baixar, excluir

---

## 🔔 Sistema de Alertas

### Alertas Visuais

**Status de Documentos:**
- **Verde (Válido):** Documento com mais de 30 dias para vencer
- **Amarelo (Vence em breve):** Documento vence em até 30 dias
- **Vermelho (Vencido):** Documento já vencido

**Localização dos Alertas:**
- Cards de documentos NR
- Dashboard de estatísticas na aba Documentação
- Lista de colaboradores (futuro)

### Sistema de E-mail (Resend)

**Configuração:**

```env
RESEND_API_KEY=re_TnEQuGqc_QFzxPWvdt6wzXQkzaptctRpD
RESEND_FROM_EMAIL=alertas@worldpav.com
APP_URL=https://worldpav.com
```

**Edge Function:** `supabase/functions/notificar-documentos-vencidos`

**Funcionamento:**
1. Executa diariamente (via cron)
2. Busca documentos vencendo em 30 dias ou já vencidos
3. Agrupa por empresa
4. Envia e-mail para admins/RH da empresa
5. Registra envio em `email_logs`

**Conteúdo do E-mail:**
- Resumo: X documentos vencendo, Y vencidos
- Tabela de colaboradores e documentos
- Links diretos para cada colaborador
- Cores diferenciadas por urgência

**Agendamento:**
- GitHub Actions (recomendado)
- EasyCron / Cron-job.org
- Vercel Cron Jobs

---

## 🔧 Configuração e Deploy

### 1. Executar Migração SQL

```bash
# Conectar ao Supabase e executar:
psql -h [HOST] -U postgres -d postgres -f db/migrations/add_colaboradores_detalhamento.sql
```

Ou via Supabase Dashboard → SQL Editor

### 2. Configurar Storage Bucket

Via código (automático na primeira execução):
```typescript
import { verificarOuCriarBucket } from './services/colaborador-storage';
await verificarOuCriarBucket();
```

Ou manualmente via Supabase Dashboard → Storage → New Bucket

### 3. Configurar Resend

**Instalar SDK:**
```bash
npm install resend
```

**Configurar secrets no Supabase:**
```bash
supabase secrets set RESEND_API_KEY=re_TnEQuGqc_QFzxPWvdt6wzXQkzaptctRpD
```

### 4. Deploy da Edge Function

```bash
supabase functions deploy notificar-documentos-vencidos
```

---

## 📊 Validações e Regras

### Validações de Arquivo
- **Tipos permitidos:** PDF, PNG, JPG, JPEG, ZIP
- **Tamanho máximo:** 10MB por arquivo
- **Validação:** Automática no componente `FileUpload`

### Validações de Formulário
- **CNH:** 11 dígitos numéricos
- **Data de validade:** Obrigatória para documentos NR
- **Data de infração:** Obrigatória para multas

### Permissões (RLS)
- Usuários veem apenas dados da própria empresa
- Baseado em `company_id` via tabela `users`

---

## 🚀 Fluxo de Uso

### Adicionar Colaborador Completo

1. **Acesse** `/colaboradores` → Clique em "Novo Colaborador"
2. **Preencha** dados básicos → Salve
3. **Clique em "Detalhes"** no colaborador criado
4. **Navegue pelas abas:**
   - **Informações:** Complete dados pessoais e CNH
   - **Documentação:** Envie todos os documentos NR
   - **Certificados:** Adicione cursos e certificações
   - **Multas:** Registre multas (se houver)
   - **Arquivos:** Anexe documentos adicionais

### Monitorar Vencimentos

1. **Acesse** detalhes do colaborador
2. **Aba Documentação** mostra status visual de todos os documentos
3. **Dashboard** exibe estatísticas: válidos, vencendo, vencidos
4. **E-mails automáticos** alertam 30 dias antes

---

## 🧪 Testes Funcionais

### Checklist

- [ ] Upload de arquivo PDF
- [ ] Upload de arquivo PNG/JPG
- [ ] Upload de arquivo ZIP
- [ ] Validação de tamanho (>10MB deve falhar)
- [ ] Validação de tipo (arquivo não permitido deve falhar)
- [ ] Cálculo de status correto (válido/vencendo/vencido)
- [ ] Auto-save em Informações Gerais
- [ ] Adicionar certificado
- [ ] Editar certificado
- [ ] Excluir certificado
- [ ] Adicionar multa
- [ ] Atualizar status de multa
- [ ] Upload múltiplo de arquivos gerais
- [ ] Excluir arquivo geral
- [ ] Navegação entre abas sem perda de dados
- [ ] Links de visualização de arquivos

---

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro ao fazer upload**
- Verificar se o bucket existe
- Verificar políticas RLS
- Verificar tamanho do arquivo

**2. Documentos não aparecem**
- Verificar `company_id` do usuário
- Verificar políticas RLS nas tabelas
- Verificar console do navegador para erros

**3. Auto-save não funciona**
- Verificar conexão com Supabase
- Ver console para erros de validação
- Verificar permissões de UPDATE

**4. E-mails não enviam**
- Verificar RESEND_API_KEY
- Verificar logs da Edge Function
- Verificar tabela `email_logs`

---

## 📝 Notas Importantes

1. **Performance:** O sistema usa indexes em todas as foreign keys e campos de data
2. **Segurança:** Todas as tabelas têm RLS habilitado e políticas configuradas
3. **Escalabilidade:** Arquivos armazenados no Supabase Storage (CDN)
4. **UX:** Auto-save silencioso para melhor experiência
5. **Compliance:** Sistema preparado para auditoria com logs e timestamps

---

## 🔄 Próximos Passos (Futuro)

- [ ] Filtro de colaboradores com documentos vencidos
- [ ] Badge na lista mostrando status de documentação
- [ ] Notificações in-app além de e-mail
- [ ] Relatório PDF de documentação completa
- [ ] Dashboard analítico de vencimentos
- [ ] Integração com calendário global
- [ ] Histórico de alterações (audit trail)

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Este documento
- Código-fonte dos componentes
- Logs do Supabase
- Console do navegador (F12)

**Última atualização:** 16 de outubro de 2025



