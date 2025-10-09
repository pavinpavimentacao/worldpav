# 📋 Programação de Pavimentação - Documentação Completa

## 📌 Visão Geral

Sistema completo para gerenciar e exportar programações de pavimentação da sua equipe de forma organizada e profissional.

---

## ✅ O que foi implementado

### 1. **Tipos TypeScript** (`src/types/programacao-pavimentacao.ts`)

Estrutura completa com os campos solicitados:

- ✅ Data
- ✅ Cliente
- ✅ Obra
- ✅ Rua
- ✅ Prefixo da Equipe
- ✅ Maquinários (múltiplos)
- ✅ Metragem Prevista (m²)
- ✅ Quantidade de Toneladas
- ✅ Faixa a Ser Realizada
- ✅ Campos opcionais: Horário início, Tipo de serviço, Espessura, Observações

**Sem campo de status** como solicitado!

### 2. **Componente de Exportação** (`src/components/programacao/ExportProgramacao.tsx`)

- Exporta para **Excel (.xlsx)** com formatação profissional
- Colunas com larguras ajustadas
- Valores numéricos formatados em pt-BR
- Nome do arquivo automático com data
- Preparado para exportação em PDF (a implementar)

### 3. **Formulário de Criação** (`src/pages/programacao/ProgramacaoPavimentacaoForm.tsx`)

Interface completa para criar programações:

- ✅ Formulário organizado em seções (Obra, Equipe, Metragem, Adicional)
- ✅ Validação de todos os campos obrigatórios
- ✅ Seleção múltipla de maquinários com badges visuais
- ✅ Select de equipes pré-definidas (Equipe A, B, C, 01, 02, 03)
- ✅ Select de tipos de serviço (CBUQ, Imprimação, PMF, Recapeamento, etc.)
- ✅ Campos numéricos para metragem e toneladas
- ✅ Campos opcionais para horário, espessura e observações

### 4. **Página de Listagem** (`src/pages/programacao/ProgramacaoPavimentacaoList.tsx`)

Interface profissional e organizada:

- ✅ **Estatísticas** no topo: Total de programações, Metragem total, Toneladas totais, Equipes ativas
- ✅ **Filtros** por busca de texto e data
- ✅ **Agrupamento por data** com visualização clara
- ✅ **Cards organizados** com todos os dados em colunas:
  - Coluna 1: Cliente e Obra
  - Coluna 2: Rua
  - Coluna 3: Equipe e Faixa
  - Coluna 4: Metragem e Toneladas
- ✅ **Badges visuais** para equipe, tipo de serviço e maquinários
- ✅ **Botão de exportação** no topo da página

### 5. **Dados Mockados** (`src/mocks/programacao-pavimentacao-mock.ts`)

5 exemplos completos de programação para teste:
- Diferentes clientes (Prefeituras e Construtoras)
- Diferentes equipes (Equipe A, B, C, 01, 02)
- Diferentes tipos de serviço (CBUQ, Recapeamento, Imprimação, PMF, Remendo)
- Diferentes maquinários
- Dados realistas para testes

### 6. **Rotas Configuradas** (`src/routes/index.tsx`)

```
/programacao/pavimentacao       → Lista de programações
/programacao/pavimentacao/nova  → Criar nova programação
```

---

## 🚀 Como Usar

### 1. **Acessar a Listagem**

Navegue para `/programacao/pavimentacao` para ver:
- Todas as programações cadastradas (mockadas)
- Estatísticas gerais
- Filtros de busca e data

### 2. **Criar Nova Programação**

1. Clique em **"Nova Programação"**
2. Preencha os campos obrigatórios:
   - Data
   - Cliente
   - Obra
   - Rua
   - Prefixo da Equipe
   - Maquinários (adicionar pelo menos 1)
   - Metragem Prevista
   - Quantidade de Toneladas
   - Faixa a Ser Realizada
3. Opcionalmente, preencha:
   - Horário de início
   - Tipo de serviço
   - Espessura
   - Observações
4. Clique em **"Salvar Programação"**

**Nota:** Atualmente salva em modo mock. Depois você integrará com o banco de dados.

### 3. **Exportar Programação**

1. Na listagem, filtre as programações que deseja exportar (por data, cliente, etc.)
2. Clique em **"Exportar Excel"**
3. O arquivo será baixado automaticamente com o nome:
   - Formato: `programacao-pavimentacao_YYYY-MM-DD.xlsx`
   - Exemplo: `programacao-pavimentacao_2025-10-09.xlsx`

O arquivo Excel terá:
- **Colunas organizadas** com larguras ajustadas
- **Cabeçalhos claros** em português
- **Valores formatados** (números com vírgula, datas dd/mm/yyyy)
- **Todos os dados** prontos para enviar à equipe

---

## 📊 Formato de Exportação

O arquivo Excel exportado contém as seguintes colunas:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| Data | Data da programação | 10/10/2025 |
| Cliente | Nome do cliente | Prefeitura de Osasco |
| Obra | Nome da obra | Pavimentação Av. dos Autonomistas |
| Rua | Endereço completo | Av. dos Autonomistas, entre Rua João Batista e Rua Santa Rita |
| Prefixo da Equipe | Identificação da equipe | Equipe A |
| Maquinários | Lista de maquinários separados por vírgula | VIB-01 - Vibroacabadora CAT, ESP-01 - Espargidor Volvo |
| Metragem Prevista (m²) | Metragem em m² | 2.500,00 |
| Quantidade de Toneladas | Toneladas programadas | 150,00 |
| Faixa a Ser Realizada | Faixa de trabalho | Faixa 1 e 2 |
| Horário Início | Horário (se preenchido) | 07:00 |
| Tipo de Serviço | Tipo (se preenchido) | CBUQ |
| Espessura (cm) | Espessura (se preenchido) | 5cm |
| Observações | Observações (se preenchido) | Programação com início prioritário |

---

## 🎨 Interface Visual

### Estatísticas (Cards no Topo)
- 📄 **Total de Programações** (azul)
- 📍 **Metragem Total** (verde)
- 🚛 **Toneladas Totais** (laranja)
- 👥 **Equipes Ativas** (roxo)

### Filtros
- 🔍 **Busca por texto:** Cliente, obra, rua ou equipe
- 📅 **Filtro por data:** Selecionar data específica

### Cards de Programação
Cada card mostra:
- **Cliente e Obra** em destaque
- **Rua** completa
- **Badge da equipe** (roxo)
- **Badge do tipo de serviço** (azul, se tiver)
- **Metragem e Toneladas** formatados
- **Faixa a ser realizada**
- **Maquinários** com ícones (cinza)
- **Observações** em itálico (se tiver)

---

## 🔄 Próximos Passos (Integração com Banco de Dados)

Quando estiver pronto para integrar com o banco de dados:

### 1. **Criar tabela no Supabase**

```sql
CREATE TABLE programacao_pavimentacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  obra TEXT NOT NULL,
  rua TEXT NOT NULL,
  prefixo_equipe TEXT NOT NULL,
  maquinarios UUID[] NOT NULL,
  metragem_prevista DECIMAL(10,2) NOT NULL,
  quantidade_toneladas DECIMAL(10,2) NOT NULL,
  faixa_realizar TEXT NOT NULL,
  horario_inicio TIME,
  tipo_servico TEXT,
  espessura TEXT,
  observacoes TEXT,
  company_id UUID NOT NULL REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_programacao_pav_data ON programacao_pavimentacao(data);
CREATE INDEX idx_programacao_pav_cliente ON programacao_pavimentacao(cliente_id);
CREATE INDEX idx_programacao_pav_company ON programacao_pavimentacao(company_id);
```

### 2. **Substituir dados mockados**

No `ProgramacaoPavimentacaoList.tsx`, substituir:

```typescript
// REMOVER
const programacoes = mockProgramacoesPavimentacao;

// ADICIONAR
const { data: programacoes } = useQuery({
  queryKey: ['programacoes-pavimentacao'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('programacao_pavimentacao')
      .select(`
        *,
        cliente:clientes(id, name)
      `)
      .order('data', { ascending: true });
    
    if (error) throw error;
    return data;
  }
});
```

### 3. **Atualizar formulário de criação**

No `ProgramacaoPavimentacaoForm.tsx`, implementar o salvamento real:

```typescript
const { data, error } = await supabase
  .from('programacao_pavimentacao')
  .insert([formData])
  .select();

if (error) throw error;
```

---

## 📝 Notas Importantes

### ✅ **Características Principais**

1. **Sem Status** - Como solicitado, não há campo de status "Em andamento"
2. **Organizado** - Layout profissional pronto para enviar à equipe
3. **Completo** - Todos os campos solicitados estão presentes
4. **Exportável** - Exportação para Excel com um clique
5. **Mockado** - Funciona independente do banco de dados (por enquanto)

### 🎯 **Benefícios**

- ✅ Exportação rápida e organizada
- ✅ Visualização clara e profissional
- ✅ Todos os dados importantes em um só lugar
- ✅ Pronto para enviar direto à equipe
- ✅ Filtros para encontrar programações rapidamente
- ✅ Estatísticas gerais em tempo real

### 🔧 **Personalizações Futuras**

Você pode facilmente adicionar:
- Mais tipos de serviço em `TIPOS_SERVICO_OPTIONS`
- Mais equipes em `EQUIPES_OPTIONS`
- Mais campos se necessário
- Exportação em PDF
- Envio por email/WhatsApp direto do sistema
- Impressão direta

---

## 📞 Suporte

Qualquer dúvida ou ajuste necessário, é só pedir! 

**Sistema pronto para uso com dados mockados. Quando quiser integrar com o banco de dados, basta seguir os passos da seção "Próximos Passos".**

---

✅ **Status:** Implementação completa em modo mockup
🎯 **Próximo passo:** Testar e validar a interface e exportação
🚀 **Futuro:** Integração com banco de dados Supabase

