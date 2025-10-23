# 🛡️ Sistema de Guardas - WorldPav

## 🎯 Visão Geral

Sistema completo para gestão de empresas de segurança, cadastro de guardas e controle de diárias para proteção de maquinários durante as obras.

## 📋 Estrutura do Sistema

### **1. Empresas de Guarda**
Cadastro de empresas fornecedoras de guardas (pessoa física ou jurídica).

**Campos:**
- Nome da empresa
- Telefone
- Documento (CPF ou CNPJ)
- Tipo de documento
- Status (ativo/inativo)

### **2. Guardas**
Cadastro individual de guardas vinculados a uma empresa.

**Campos:**
- Nome do guarda
- Telefone
- Empresa fornecedora
- Status (ativo/inativo)

### **3. Diárias de Guarda**
Registro detalhado de cada diária de segurança.

**Campos:**
- Guarda responsável
- Solicitante (quem pediu o guarda)
- Valor da diária (R$)
- Data da diária
- Turno (Manhã, Tarde, Noite, Madrugada)
- Nome da rua (local)
- Maquinários protegidos (múltipla seleção)
- Foto do maquinário (opcional)
- Observações

## 🗂️ Estrutura de Dados

### **Empresa de Guarda**
```typescript
{
  id: 'emp-guarda-001',
  nome: 'Segurança Total Ltda',
  telefone: '(11) 98765-4321',
  documento: '12345678000190',
  tipo_documento: 'CNPJ',
  ativo: true,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z'
}
```

### **Guarda**
```typescript
{
  id: 'guarda-001',
  nome: 'Carlos Eduardo Silva',
  telefone: '(11) 99876-5432',
  empresa_id: 'emp-guarda-001',
  empresa_nome: 'Segurança Total Ltda',
  ativo: true,
  created_at: '2025-01-16T08:00:00Z',
  updated_at: '2025-01-16T08:00:00Z'
}
```

### **Diária de Guarda (Completa)**
```typescript
{
  id: 'diaria-001',
  guarda_id: 'guarda-001',
  guarda_nome: 'Carlos Eduardo Silva',
  empresa_id: 'emp-guarda-001',
  empresa_nome: 'Segurança Total Ltda',
  solicitante: 'João Gerente',
  valor_diaria: 250.00,
  data_diaria: '2025-10-15',
  turno: 'noite',
  rua: 'Rua das Flores',
  foto_maquinario_url: 'https://...',
  observacoes: 'Guarda para vibroacabadora',
  created_at: '2025-10-15T18:00:00Z',
  updated_at: '2025-10-15T18:00:00Z',
  maquinarios: [
    {
      id: 'diaria-maq-001',
      diaria_id: 'diaria-001',
      maquinario_id: 'maq-001',
      maquinario_nome: 'Vibroacabadora CAT AP1055F',
      created_at: '2025-10-15T18:00:00Z'
    }
  ]
}
```

## 🎨 Interface do Usuário

### **Dashboard Principal**
```
┌─────────────────────────────────────────────┐
│  🛡️ Gestão de Guardas                      │
│  Empresas, guardas e controle de diárias    │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────┬──────────┬──────────┬────────┐│
│  │  Total   │  Valor   │ Guardas  │Empresas││
│  │ Diárias  │  Total   │ Ativos   │        ││
│  │    15    │ R$ 3.750 │    5     │   3    ││
│  └──────────┴──────────┴──────────┴────────┘│
│                                              │
│  [Diárias] [Guardas] [Empresas]             │
│                                              │
└─────────────────────────────────────────────┘
```

### **Aba: Empresas**
- Lista em grid de empresas cadastradas
- Botão "+ Nova Empresa"
- Formulário modal com campos:
  - Nome da empresa
  - Telefone
  - Tipo de documento (CPF/CNPJ - radio)
  - Número do documento
- Validação de CPF/CNPJ
- Formatação automática

### **Aba: Guardas**
- Lista em grid de guardas por empresa
- Busca por nome ou empresa
- Botão "+ Novo Guarda"
- Formulário modal com campos:
  - Nome do guarda
  - Telefone
  - Empresa (select)

### **Aba: Diárias**
- Lista cronológica de diárias
- Card por diária com:
  - Guarda e empresa
  - Data e turno (com cores)
  - Valor da diária
  - Quantidade de maquinários
  - Rua
  - Solicitante
  - Ícone 👁️ para ver detalhes
- Botão "+ Nova Diária"
- Formulário modal completo

## 📝 Formulário de Diária

### **Campos Obrigatórios**
1. **Guarda** (select)
   - Lista todos os guardas ativos
   - Mostra: Nome - Empresa

2. **Solicitante** (text)
   - Nome de quem solicitou
   - Ex: "João Gerente"

3. **Valor da Diária** (number)
   - Em reais
   - Ex: 250.00

4. **Data** (date)
   - Data da diária

5. **Turno** (select)
   - 🌅 Manhã
   - ☀️ Tarde
   - 🌙 Noite
   - 🌃 Madrugada

6. **Nome da Rua** (text)
   - Local onde o maquinário está
   - Ex: "Rua das Flores"

7. **Maquinários** (checkbox múltiplo)
   - Lista todos os maquinários cadastrados
   - Permite selecionar vários
   - Mostra contador de selecionados

### **Campos Opcionais**
8. **Foto do Maquinário** (upload)
   - JPG ou PNG até 5MB
   - Preview da imagem
   - Botão para remover

9. **Observações** (textarea)
   - Informações adicionais

## 🎯 Turnos e Cores

| Turno | Ícone | Cor de Fundo | Cor do Texto |
|-------|-------|--------------|--------------|
| Manhã | 🌅 | Amarelo claro | Amarelo escuro |
| Tarde | ☀️ | Laranja claro | Laranja escuro |
| Noite | 🌙 | Índigo claro | Índigo escuro |
| Madrugada | 🌃 | Roxo claro | Roxo escuro |

## 🗄️ Banco de Dados

### **Tabelas**

#### **empresas_guarda**
```sql
CREATE TABLE empresas_guarda (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  documento TEXT NOT NULL,
  tipo_documento TEXT CHECK (tipo_documento IN ('CPF', 'CNPJ')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by TEXT REFERENCES auth.users(id)
);
```

#### **guardas**
```sql
CREATE TABLE guardas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  empresa_id TEXT REFERENCES empresas_guarda(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by TEXT REFERENCES auth.users(id)
);
```

#### **diarias_guarda**
```sql
CREATE TABLE diarias_guarda (
  id TEXT PRIMARY KEY,
  guarda_id TEXT REFERENCES guardas(id),
  empresa_id TEXT REFERENCES empresas_guarda(id),
  solicitante TEXT NOT NULL,
  valor_diaria NUMERIC(10, 2) CHECK (valor_diaria > 0),
  data_diaria DATE NOT NULL,
  turno TEXT CHECK (turno IN ('manha', 'tarde', 'noite', 'madrugada')),
  rua TEXT NOT NULL,
  foto_maquinario_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by TEXT REFERENCES auth.users(id)
);
```

#### **diarias_maquinarios**
```sql
CREATE TABLE diarias_maquinarios (
  id TEXT PRIMARY KEY,
  diaria_id TEXT REFERENCES diarias_guarda(id),
  maquinario_id TEXT,
  created_at TIMESTAMP
);
```

## 🔗 Relacionamentos

```
Empresa de Guarda (1) ──┐
                         ├──> Guarda (N)
                         │
                         └──> Diária (N)
                              │
                              └──> Maquinários (N)
```

## 📊 Estatísticas

```typescript
{
  totalEmpresas: 3,
  totalGuardas: 5,
  totalDiarias: 15,
  valorTotal: 3750.00,
  valorMedio: 250.00
}
```

## 🚀 Rotas

- **Principal**: `/guardas`
  - Tab: Diárias (padrão)
  - Tab: Guardas
  - Tab: Empresas

## 🎨 Cores do Sistema

| Elemento | Cor |
|----------|-----|
| Ícone principal | `bg-blue-600` (🛡️ Shield) |
| Empresas | `bg-blue-100` / `text-blue-600` |
| Guardas | `bg-purple-100` / `text-purple-600` |
| Diárias | `bg-blue-100` / `text-blue-600` |

## ✅ Funcionalidades Implementadas

- [x] Cadastro de empresas de guarda (CPF/CNPJ)
- [x] Cadastro de guardas vinculados a empresas
- [x] Registro de diárias com múltiplos maquinários
- [x] Upload de foto do maquinário
- [x] Seleção de turno (Manhã, Tarde, Noite, Madrugada)
- [x] Validação de documentos (CPF/CNPJ)
- [x] Formatação automática de documentos
- [x] Modal de detalhes da diária
- [x] Estatísticas agregadas
- [x] Busca e filtros
- [x] Interface responsiva
- [x] Integração no sidebar
- [x] Rota configurada

## 📂 Arquivos Criados

### **Types**
- `src/types/guardas.ts`

### **Mocks**
- `src/mocks/guardas-mock.ts`

### **Páginas**
- `src/pages/guardas/GuardasIndex.tsx`

### **Componentes**
- `src/components/guardas/EmpresasGuardaTab.tsx`
- `src/components/guardas/GuardasTab.tsx`
- `src/components/guardas/DiariasGuardaTab.tsx`

### **Migrations**
- `db/migrations/create_guardas_sistema.sql`

### **Documentação**
- `Docs/SISTEMA_GUARDAS.md`

## 💡 Próximos Passos

1. **Relatórios**
   - Relatório mensal por guarda
   - Relatório de custos por obra
   - Exportar para PDF/Excel

2. **Integrações**
   - Vincular diárias a obras específicas
   - Integrar com sistema de faturamento
   - Alertas de vencimento de documentos

3. **Melhorias**
   - Dashboard analítico
   - Gráficos de custos
   - Histórico de diárias por maquinário

---

**Status**: ✅ **Sistema completo e funcional em modo mock**
**Pronto para**: Testes, validação e integração com banco de dados


