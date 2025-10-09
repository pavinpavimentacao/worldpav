# 📅 Calendário Visual de Programação - WorldPav

## 🎯 Visão Geral

Calendário **altamente visual e interativo** para gerenciamento de programações de pavimentação.  
Desenvolvido com foco em **UX excepcional** e **exportação otimizada para PDF**.

---

## ✨ Características Principais

### 🎨 Visual Inovador
- **Timeline semanal** com cards de programações
- **Código de cores** por status (Agendada, Em Andamento, Concluída)
- **Animações fluidas** com Framer Motion
- **Badges de contagem** em cada dia
- **Hover effects** e feedback visual em tempo real

### 📊 Funcionalidades

#### 1. Visualização Semanal
- Navegação entre semanas (Anterior / Próxima)
- Botão "Hoje" para voltar à semana atual
- Destaque visual do dia atual
- Seleção de dia com efeito de zoom

#### 2. Cards de Programação
Cada programação exibe:
- ✅ Nome da obra
- 👤 Cliente
- 👥 Equipe responsável
- 🚜 Maquinários (com badge "+N" se houver mais de 2)
- 🎨 Status colorido (borda lateral)

#### 3. Exportação PDF Otimizada
- **Um clique** para exportar todas as programações do dia
- **PDF profissional** com:
  - Header com logo e data
  - Resumo estatístico
  - Cards detalhados de cada programação
  - Código de cores mantido
  - Footer com data de geração e paginação
- **Otimizado para impressão** e envio digital

---

## 🎨 Código de Cores

| Status | Cor | Uso |
|--------|-----|-----|
| **Agendada** | Azul (`#3B82F6`) | Obras futuras planejadas |
| **Em Andamento** | Amarelo (`#EAB308`) | Obras em execução |
| **Concluída** | Verde (`#22C55E`) | Obras finalizadas |

---

## 🚀 Como Usar

### Navegação no Calendário

1. **Ver semana anterior/próxima:** Clique nas setas `<` `>`
2. **Voltar para hoje:** Clique no botão "Hoje"
3. **Selecionar um dia:** Clique sobre o dia desejado
4. **Ver detalhes de uma programação:** Clique no card da programação

### Exportar Programações do Dia

#### Método 1: Hover + Download
1. Passe o mouse sobre um dia que tenha programações
2. Clique no ícone de **download** (📥) que aparece no canto inferior direito
3. PDF será gerado e baixado automaticamente

#### Método 2: Programático
```typescript
const handleExportDay = (date: Date, programacoesDay: Programacao[]) => {
  exportarProgramacaoDiaPDF(date, programacoesDay);
  toast.success('PDF gerado com sucesso!');
};
```

---

## 📦 Estrutura de Dados

### Interface `Programacao`
```typescript
interface Programacao {
  id: string;
  data_inicio: string;        // ISO format: 'yyyy-MM-dd'
  data_fim: string;            // ISO format: 'yyyy-MM-dd'
  cliente: string;
  obra: string;
  equipe: string;
  localizacao: string;
  maquinarios: string[];
  status: 'agendada' | 'em_andamento' | 'concluida';
}
```

### Exemplo de Programação
```typescript
{
  id: '1',
  data_inicio: '2025-10-08',
  data_fim: '2025-10-10',
  cliente: 'Prefeitura Municipal',
  obra: 'Avenida Brasil - Recapeamento',
  equipe: 'Equipe A',
  localizacao: 'Av. Brasil, km 10 - Centro',
  maquinarios: ['Vibroacabadora', 'Rolo Pneumático', 'Caminhão Pipa'],
  status: 'em_andamento'
}
```

---

## 🛠️ Componentes

### 1. `ProgramacaoCalendar.tsx`
**Localização:** `/src/components/ProgramacaoCalendar.tsx`

**Props:**
```typescript
interface ProgramacaoCalendarProps {
  programacoes: Programacao[];
  onDayClick?: (date: Date) => void;
  onProgramacaoClick?: (programacao: Programacao) => void;
  onExportDay?: (date: Date, programacoes: Programacao[]) => void;
}
```

**Uso:**
```tsx
<ProgramacaoCalendar
  programacoes={programacoes}
  onDayClick={(date) => console.log(date)}
  onProgramacaoClick={(prog) => console.log(prog)}
  onExportDay={(date, progs) => exportarProgramacaoDiaPDF(date, progs)}
/>
```

### 2. `pdfExport.ts`
**Localização:** `/src/utils/pdfExport.ts`

**Funções Disponíveis:**

#### `exportarProgramacaoDiaPDF(date, programacoes)`
Exporta todas as programações de um dia específico em PDF profissional.

**Parâmetros:**
- `date: Date` - Data do dia a ser exportado
- `programacoes: Programacao[]` - Array de programações do dia

**Exemplo:**
```typescript
import { exportarProgramacaoDiaPDF } from '@/utils/pdfExport';

const handleExport = () => {
  const hoje = new Date();
  const programacoesHoje = programacoes.filter(/* filtro por data */);
  exportarProgramacaoDiaPDF(hoje, programacoesHoje);
};
```

#### `exportarProgramacaoDetalhada(programacao)`
Exporta uma programação específica com todos os detalhes.

**Parâmetros:**
- `programacao: Programacao` - Programação a ser exportada

---

## 📱 Responsividade

### Desktop (≥1024px)
- Grid de 7 colunas (semana completa)
- Cards com altura fixa e scroll interno
- Hover effects completos

### Tablet (768px - 1023px)
- Grid de 7 colunas (compacto)
- Cards menores com informações essenciais

### Mobile (<768px)
- Grid de 1-2 colunas (dias empilhados)
- Cards full-width
- Touch interactions otimizadas

---

## 🎬 Animações

### Entrada do Calendário
```typescript
// Cada dia entra com delay escalonado
transition={{ delay: index * 0.05 }}
```

### Seleção de Dia
```typescript
// Escala e destaque ao selecionar
className={isSelected ? 'scale-105 border-blue-600 shadow-lg' : ''}
```

### Cards de Programação
```typescript
// Entrada animada de cada programação
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
whileHover={{ scale: 1.02 }}
```

### Botão de Exportar
```typescript
// Aparece suavemente ao hover
initial={{ opacity: 0 }}
whileHover={{ opacity: 1 }}
```

---

## 📄 Formato do PDF Exportado

### Estrutura do PDF

#### 1. **Header** (fixo em todas as páginas)
- Logo "WorldPav" em azul
- Subtítulo "Sistema de Gestão de Pavimentação"
- Data da programação (ex: "08 de outubro de 2025")

#### 2. **Resumo do Dia**
- Total de programações
- Contador por status (Agendadas, Em Andamento, Concluídas)

#### 3. **Cards de Programações**
Cada programação é renderizada como um card com:
- **Borda lateral colorida** (baseada no status)
- **Número sequencial** (#1, #2, etc.)
- **Badge de status** no canto superior direito
- **Título:** Nome da obra em destaque
- **Informações:** Cliente, Equipe, Localização
- **Maquinários:** Lista completa com quebra de linha automática

#### 4. **Footer** (em todas as páginas)
- Data e hora de geração
- Numeração de páginas (Página X de Y)

### Paginação Automática
O sistema detecta quando não há mais espaço na página e cria automaticamente uma nova página.

---

## 💡 Diferenciais de UX

### 1. **Zero Configuração**
Basta passar o array de programações e tudo funciona automaticamente.

### 2. **Feedback Visual Instantâneo**
- Hover effects em todos os elementos interativos
- Animações suaves e não invasivas
- Toast notifications para ações importantes

### 3. **Exportação com 1 Clique**
O botão de download aparece **somente** quando o usuário passa o mouse sobre um dia com programações.  
Isso mantém a interface limpa e intuitiva.

### 4. **Código de Cores Consistente**
As mesmas cores usadas no calendário são mantidas no PDF exportado.

### 5. **Dados Mockados Realistas**
7 programações de exemplo cobrindo diferentes cenários:
- Programações de múltiplos dias
- Diferentes clientes e equipes
- Variação de maquinários
- Todos os status representados

---

## 🔧 Personalização

### Mudar Cores do Status

**No componente:**
```typescript
// ProgramacaoCalendar.tsx - linha ~100
const getStatusColor = (status: string) => {
  switch (status) {
    case 'agendada':
      return 'bg-purple-100 text-purple-800 border-purple-300'; // Nova cor
    // ...
  }
};
```

**No PDF:**
```typescript
// pdfExport.ts - linha ~80
case 'agendada':
  statusColor = [147, 51, 234]; // purple-600
  break;
```

### Adicionar Novos Campos

1. Atualizar interface `Programacao`
2. Adicionar campo no card do calendário
3. Incluir no PDF (`pdfExport.ts`)

---

## 📊 Estatísticas na Página

A página de listagem exibe **4 cards de estatísticas**:

1. **Total** - Todas as programações
2. **Agendadas** - Obras futuras
3. **Em Andamento** - Obras ativas
4. **Concluídas** - Obras finalizadas

Cada card tem:
- Ícone representativo
- Número grande e legível
- Descrição contextual
- Cores consistentes com o status

---

## 🚨 Tratamento de Erros

### Dia sem Programações
```typescript
if (programacoesDay.length === 0) {
  toast.warning('Nenhuma programação neste dia');
  return;
}
```

### Sucesso na Exportação
```typescript
toast.success('PDF gerado com sucesso!', {
  description: `${programacoesDay.length} programação(ões) exportada(s)`,
});
```

---

## 🎯 Casos de Uso

### 1. **Gerente de Obras**
- Visualiza rapidamente a semana inteira
- Identifica dias sobrecarregados
- Exporta programação do dia para reunião matinal

### 2. **Coordenador de Equipe**
- Verifica programações da sua equipe
- Exporta PDF com detalhes para enviar ao time
- Acompanha status de execução

### 3. **Cliente/Fiscal**
- Visualiza cronograma de forma clara
- Recebe PDFs profissionais por e-mail
- Acompanha andamento das obras

---

## 📈 Performance

### Otimizações Implementadas
- ✅ Renderização condicional de cards
- ✅ Scroll interno nos dias (não cresce a página)
- ✅ Lazy animations (delay escalonado)
- ✅ Memoização de filtros
- ✅ PDF gerado no cliente (sem requisição ao servidor)

---

## 🔮 Melhorias Futuras

- [ ] Filtros por cliente/equipe
- [ ] Drag & drop para reagendar programações
- [ ] View mensal além da semanal
- [ ] Exportação em Excel
- [ ] Notificações push no dia da obra
- [ ] Integração com Google Calendar
- [ ] Timeline de horas (além de dias)
- [ ] Modo escuro

---

## 📚 Dependências

- `framer-motion` - Animações
- `date-fns` - Manipulação de datas
- `jspdf` + `jspdf-autotable` - Geração de PDF
- `lucide-react` - Ícones
- `sonner` - Toast notifications

---

## 🎉 Resultado Final

Um sistema de calendário **visualmente impressionante**, **intuitivo** e **funcional** que:

✅ Permite visualização clara de todas as programações  
✅ Oferece exportação PDF profissional em 1 clique  
✅ Funciona perfeitamente em qualquer dispositivo  
✅ Tem animações suaves e não invasivas  
✅ Código limpo e bem organizado  

**Desenvolvido para surpreender! 🚀**

---

**Data de criação:** Outubro de 2025  
**Versão:** 2.0.0  
**Status:** ✅ Pronto para produção

