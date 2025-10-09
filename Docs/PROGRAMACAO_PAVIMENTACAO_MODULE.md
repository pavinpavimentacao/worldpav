# 📋 Módulo de Programação de Pavimentação

## 📍 Visão Geral

Este módulo permite criar programações de pavimentação asfáltica de forma **simples, visual e fluida**.  
Foi desenvolvido com foco em **UX moderna**, pensado para ser usado por qualquer pessoa, incluindo operadores de campo.

---

## 🎯 Objetivo

Permitir que usuários criem programações de obras de pavimentação asfáltica selecionando:
- **Equipe** responsável pela obra
- **Cliente** e **Obra** relacionados
- **Maquinários** necessários
- **Período** da programação (data de início e fim)
- **Localização** da obra

---

## 🏗️ Arquitetura

### Componentes

#### 1. `ProgramacaoPavimentacaoForm.tsx`
**Localização:** `/src/components/ProgramacaoPavimentacaoForm.tsx`

**Responsabilidade:**  
Formulário principal com toda a lógica de criação de programação.

**Características:**
- ✅ Validação com **Zod** e **React Hook Form**
- ✅ Animações com **Framer Motion**
- ✅ Design responsivo (mobile-first)
- ✅ Seleção visual de maquinários (cards interativos)
- ✅ **RangeCalendar** para seleção de período
- ✅ Dropdowns dinâmicos (obras filtradas por cliente)
- ✅ Preview em JSON para desenvolvimento

**Props:**
```typescript
interface ProgramacaoPavimentacaoFormProps {
  onSubmit?: (data: ProgramacaoFormData) => void;
  onCancel?: () => void;
}
```

#### 2. `ProgramacaoPavimentacao.tsx`
**Localização:** `/src/pages/programacao/ProgramacaoPavimentacao.tsx`

**Responsabilidade:**  
Página que integra o formulário com header e navegação.

**Características:**
- ✅ Header com botão "Voltar"
- ✅ Background com gradiente suave
- ✅ Integração com React Router

---

## 📦 Schema de Dados

### Estrutura de Programação

```typescript
{
  equipe: string;           // ID da equipe
  cliente: string;          // ID do cliente
  obra: string;             // ID da obra
  localizacao: string;      // Texto livre com localização
  maquinarios: string[];    // Array de IDs de maquinários
  data_inicio: string;      // Data de início (ISO format)
  data_fim: string;         // Data de término (ISO format)
}
```

### Validação (Zod Schema)

```typescript
const programacaoSchema = z.object({
  equipe: z.string().min(1, 'Selecione uma equipe'),
  cliente: z.string().min(1, 'Selecione um cliente'),
  obra: z.string().min(1, 'Selecione uma obra'),
  localizacao: z.string().min(3, 'Informe a localização da obra'),
  maquinarios: z.array(z.string()).min(1, 'Selecione pelo menos um maquinário'),
  data_inicio: z.string().min(1, 'Selecione a data de início'),
  data_fim: z.string().min(1, 'Selecione a data de término'),
});
```

---

## 🎨 Design e UX

### Paleta de Cores
- **Primária:** Azul (`#2563eb` - blue-600)
- **Background:** Gradiente cinza (`from-gray-50 to-gray-100`)
- **Cards:** Branco com sombra sutil
- **Selecionados:** Azul claro (`bg-blue-50` com borda `border-blue-600`)

### Animações
- **Entrada:** Fade in + Slide up (stagger para seções)
- **Seleção de maquinários:** Scale + Rotate ao selecionar
- **Hover:** Scale 1.02 nos cards
- **Tap:** Scale 0.98 (feedback tátil)

### Responsividade

#### Desktop (≥768px)
- Grid de 2 colunas para campos básicos
- Grid de 3 colunas para maquinários
- Calendário centralizado

#### Mobile (<768px)
- Coluna única para todos os campos
- Cards de maquinários empilhados
- Calendário full-width

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **React** | Framework principal |
| **TypeScript** | Tipagem estática |
| **React Hook Form** | Gerenciamento de formulário |
| **Zod** | Validação de schema |
| **Framer Motion** | Animações |
| **Tailwind CSS** | Estilização |
| **Shadcn UI** | Componentes UI (Card, Select, Button, etc.) |
| **React Aria Components** | RangeCalendar acessível |
| **Sonner** | Toast notifications |

---

## 🚀 Como Usar

### 1. Acessar a Página

A página está disponível na rota:
```
/programacao/nova
```

### 2. Fluxo de Criação

1. **Selecionar Equipe** → Dropdown com equipes cadastradas
2. **Selecionar Cliente** → Dropdown com clientes
3. **Selecionar Obra** → Dropdown dinâmico (filtrado pelo cliente)
4. **Informar Localização** → Campo de texto livre
5. **Selecionar Maquinários** → Cards interativos com checkbox
6. **Selecionar Período** → RangeCalendar visual
7. **Criar Programação** → Botão principal

### 3. Validações

O formulário valida:
- ✅ Todos os campos obrigatórios preenchidos
- ✅ Pelo menos 1 maquinário selecionado
- ✅ Período completo (início e fim)
- ✅ Localização com mínimo de 3 caracteres

---

## 📊 Dados Mockados (para testes)

Atualmente o componente usa dados mockados para facilitar o desenvolvimento e testes:

### Equipes
- Equipe A
- Equipe B
- Equipe C

### Clientes e Obras
**Prefeitura Municipal:**
- Avenida Brasil
- Rua das Flores
- Via Expressa Norte

**Construtora Alfa:**
- Condomínio Sol
- Residencial Vila Nova

**Construtora Beta:**
- Distrito Industrial
- Parque Empresarial

### Maquinários
- Vibroacabadora (Modelo VT-100)
- Rolo Pneumático (Modelo RP-50)
- Caminhão Pipa (15.000 litros)
- Fresadora (Modelo FR-200)
- Rolo Compactador (Modelo RC-75)
- Escavadeira (Modelo EC-300)

---

## 🔌 Integração com Supabase (Próximo Passo)

### Tabelas Necessárias

Para integrar com o backend, será necessário criar/adaptar as seguintes tabelas:

#### `programacoes_pavimentacao`
```sql
CREATE TABLE programacoes_pavimentacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipe_id UUID REFERENCES equipes(id),
  cliente_id UUID REFERENCES clients(id),
  obra_id UUID REFERENCES obras(id),
  localizacao TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `programacao_maquinarios` (relação N:N)
```sql
CREATE TABLE programacao_maquinarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programacao_id UUID REFERENCES programacoes_pavimentacao(id) ON DELETE CASCADE,
  maquinario_id UUID REFERENCES maquinarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Service Layer (exemplo)

```typescript
// src/services/programacaoPavimentacaoService.ts
import { supabase } from '../lib/supabase';

export async function createProgramacao(data: ProgramacaoFormData) {
  const { data: programacao, error: progError } = await supabase
    .from('programacoes_pavimentacao')
    .insert({
      equipe_id: data.equipe,
      cliente_id: data.cliente,
      obra_id: data.obra,
      localizacao: data.localizacao,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim,
    })
    .select()
    .single();

  if (progError) throw progError;

  // Inserir relações de maquinários
  const maquinariosRelations = data.maquinarios.map(maq => ({
    programacao_id: programacao.id,
    maquinario_id: maq,
  }));

  const { error: maqError } = await supabase
    .from('programacao_maquinarios')
    .insert(maquinariosRelations);

  if (maqError) throw maqError;

  return programacao;
}
```

---

## 📱 Preview de Desenvolvimento

O componente inclui um **card de preview** que exibe em tempo real (JSON) os dados do formulário.  
Útil para debug e validação durante o desenvolvimento.

**Localização:** Final da página  
**Formato:** JSON formatado com syntax highlighting

---

## 🎨 Componentes UI Utilizados

### Shadcn UI
- `Card` - Container principal
- `Button` - Botões de ação
- `Input` - Campos de texto
- `Label` - Labels dos campos
- `Select` - Dropdowns
- `Separator` - Divisórias visuais

### React Aria Components
- `JollyRangeCalendar` - Seleção de período

### Lucide Icons
- `Calendar` - Ícone de calendário
- `Users` - Ícone de equipe
- `MapPin` - Ícone de localização
- `Building2` - Ícone de cliente
- `HardHat` - Ícone de maquinários
- `CheckCircle2` - Checkbox selecionado
- `Circle` - Checkbox não selecionado
- `ArrowLeft` - Voltar

---

## ✅ Checklist de Implementação

- [x] Criar componente `ProgramacaoPavimentacaoForm`
- [x] Implementar validação com Zod
- [x] Adicionar animações com Framer Motion
- [x] Criar RangeCalendar integrado
- [x] Implementar seleção dinâmica de obras
- [x] Criar cards interativos de maquinários
- [x] Adicionar página de programação
- [x] Configurar rotas
- [x] Criar documentação
- [ ] Integrar com Supabase (backend)
- [ ] Adicionar testes unitários
- [ ] Criar página de listagem de programações
- [ ] Implementar edição de programações
- [ ] Adicionar exportação de programações (PDF/Excel)

---

## 🐛 Troubleshooting

### Problema: Calendário não atualiza as datas
**Solução:** Verificar se o `Controller` do React Hook Form está corretamente configurado e se o `setValue` está sendo chamado no `onChange` do RangeCalendar.

### Problema: Obras não aparecem ao selecionar cliente
**Solução:** Confirmar que o `useEffect` que monitora `clienteSelecionado` está funcionando e que os dados mockados seguem a estrutura correta.

### Problema: Animações não funcionam
**Solução:** Verificar se o Framer Motion está instalado (`npm install framer-motion`) e se os imports estão corretos.

---

## 📚 Referências

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 👨‍💻 Desenvolvimento

**Criado em:** Outubro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para testes

---

## 🎯 Próximos Passos

1. **Integração com Supabase**
   - Criar tabelas no banco
   - Implementar service layer
   - Substituir dados mockados por queries reais

2. **Página de Listagem**
   - Grid de programações
   - Filtros por data, cliente, obra
   - Busca textual

3. **Funcionalidades Adicionais**
   - Edição de programações
   - Exclusão de programações
   - Duplicação de programações
   - Exportação para PDF/Excel
   - Notificações por e-mail

4. **Melhorias de UX**
   - Adicionar tour guiado (tooltips)
   - Atalhos de teclado
   - Drag & drop para reordenar maquinários
   - Vista de calendário (mensal/semanal)

---

**Desenvolvido com foco em simplicidade, performance e experiência do usuário.** 🚀

