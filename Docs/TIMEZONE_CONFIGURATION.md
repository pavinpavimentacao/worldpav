# Configuração de Timezone - São Paulo (UTC-3)

## 🌍 Visão Geral

O sistema WorldPav está configurado para usar o timezone de **São Paulo (America/Sao_Paulo)**, que corresponde ao **UTC-3** (horário de Brasília).

## 📁 Arquivos de Configuração

### 1. `/src/config/timezone.ts`
- Configuração principal do timezone do sistema
- Define `SYSTEM_TIMEZONE = 'America/Sao_Paulo'`
- Configurações de formatação de data/hora

### 2. `/src/config/timezone-setup.ts`
- Configuração avançada de timezone
- Funções utilitárias para manipulação de datas
- Inicialização automática do timezone

### 3. `/src/utils/date-utils.ts`
- Utilitários para manipulação de datas com timezone
- Funções para conversão e formatação
- Suporte completo ao timezone de São Paulo

## 🔧 Configurações Aplicadas

### Vite Configuration (`vite.config.ts`)
```typescript
define: {
  'process.env.TZ': JSON.stringify('America/Sao_Paulo'),
  'import.meta.env.VITE_TIMEZONE': JSON.stringify('America/Sao_Paulo'),
}
```

### Main Application (`main.tsx`)
```typescript
import { setupSaoPauloTimezone } from './config/timezone-setup'
setupSaoPauloTimezone()
```

## 📅 Componentes de Data

### DatePicker (`/src/components/ui/date-picker.tsx`)
- Usa timezone de São Paulo para todas as operações
- Formatação consistente em português brasileiro
- Suporte a validações de data mínima/máxima

### Exemplo de Uso:
```typescript
<DatePicker
  label="Data de Carregamento"
  value={formData.dataCarregamento}
  onChange={(value) => handleInputChange('dataCarregamento', value)}
  required
  placeholder="Selecionar data"
/>
```

## 🕐 Comportamento do Sistema

### 1. **Exibição de Datas**
- Todas as datas são exibidas no formato brasileiro: `DD/MM/YYYY`
- Horário sempre no timezone de São Paulo (UTC-3)

### 2. **Armazenamento**
- Datas são armazenadas em UTC no banco de dados
- Conversão automática para São Paulo na exibição

### 3. **Formulários**
- Inputs de data usam o componente `DatePicker` padronizado
- Validações consideram o timezone de São Paulo

## 📊 Páginas Atualizadas

### ✅ Páginas com DatePicker Atualizado:
1. **Novo Carregamento** (`/parceiros/:id/novo-carregamento`)
2. **Nova Obra** (`/obras/new`)
3. **Novo Colaborador** (`/colaboradores/new`)
4. **Nova Programação** (`/programacao/nova`)
5. **Editar Pagamento** (`/pagamentos-receber/:id/edit`)

## 🧪 Como Testar

### 1. **Verificar Console**
```javascript
// No console do navegador, deve aparecer:
🌍 [Timezone] Configurado para São Paulo: {
  timezone: "America/Sao_Paulo",
  timestamp: "2024-01-XX...",
  localTime: "XX/XX/XXXX XX:XX:XX"
}
```

### 2. **Testar Componentes de Data**
- Acesse qualquer formulário com campo de data
- Verifique se as datas são exibidas no formato brasileiro
- Confirme que o calendário abre corretamente

### 3. **Verificar Formatação**
- Datas devem aparecer como: `25/01/2024`
- Horários devem considerar o fuso de São Paulo

## 🔍 Troubleshooting

### Problema: Datas aparecem em formato americano
**Solução**: Verificar se o `DatePicker` está importando corretamente o `TIMEZONE`

### Problema: Horário incorreto
**Solução**: Verificar se `setupSaoPauloTimezone()` está sendo chamado no `main.tsx`

### Problema: Erro de timezone no build
**Solução**: Verificar se as configurações no `vite.config.ts` estão corretas

## 📝 Notas Importantes

1. **Horário de Verão**: O timezone `America/Sao_Paulo` já considera automaticamente o horário de verão brasileiro
2. **Consistência**: Todos os componentes de data devem usar o `DatePicker` padronizado
3. **Performance**: As configurações são aplicadas uma vez na inicialização da aplicação
4. **Compatibilidade**: Funciona tanto em desenvolvimento quanto em produção

## 🚀 Benefícios

- ✅ **Consistência**: Todas as datas seguem o mesmo padrão
- ✅ **Usabilidade**: Interface familiar para usuários brasileiros
- ✅ **Precisão**: Horário correto independente do servidor
- ✅ **Manutenibilidade**: Configuração centralizada e fácil de atualizar


## 🌍 Visão Geral

O sistema WorldPav está configurado para usar o timezone de **São Paulo (America/Sao_Paulo)**, que corresponde ao **UTC-3** (horário de Brasília).

## 📁 Arquivos de Configuração

### 1. `/src/config/timezone.ts`
- Configuração principal do timezone do sistema
- Define `SYSTEM_TIMEZONE = 'America/Sao_Paulo'`
- Configurações de formatação de data/hora

### 2. `/src/config/timezone-setup.ts`
- Configuração avançada de timezone
- Funções utilitárias para manipulação de datas
- Inicialização automática do timezone

### 3. `/src/utils/date-utils.ts`
- Utilitários para manipulação de datas com timezone
- Funções para conversão e formatação
- Suporte completo ao timezone de São Paulo

## 🔧 Configurações Aplicadas

### Vite Configuration (`vite.config.ts`)
```typescript
define: {
  'process.env.TZ': JSON.stringify('America/Sao_Paulo'),
  'import.meta.env.VITE_TIMEZONE': JSON.stringify('America/Sao_Paulo'),
}
```

### Main Application (`main.tsx`)
```typescript
import { setupSaoPauloTimezone } from './config/timezone-setup'
setupSaoPauloTimezone()
```

## 📅 Componentes de Data

### DatePicker (`/src/components/ui/date-picker.tsx`)
- Usa timezone de São Paulo para todas as operações
- Formatação consistente em português brasileiro
- Suporte a validações de data mínima/máxima

### Exemplo de Uso:
```typescript
<DatePicker
  label="Data de Carregamento"
  value={formData.dataCarregamento}
  onChange={(value) => handleInputChange('dataCarregamento', value)}
  required
  placeholder="Selecionar data"
/>
```

## 🕐 Comportamento do Sistema

### 1. **Exibição de Datas**
- Todas as datas são exibidas no formato brasileiro: `DD/MM/YYYY`
- Horário sempre no timezone de São Paulo (UTC-3)

### 2. **Armazenamento**
- Datas são armazenadas em UTC no banco de dados
- Conversão automática para São Paulo na exibição

### 3. **Formulários**
- Inputs de data usam o componente `DatePicker` padronizado
- Validações consideram o timezone de São Paulo

## 📊 Páginas Atualizadas

### ✅ Páginas com DatePicker Atualizado:
1. **Novo Carregamento** (`/parceiros/:id/novo-carregamento`)
2. **Nova Obra** (`/obras/new`)
3. **Novo Colaborador** (`/colaboradores/new`)
4. **Nova Programação** (`/programacao/nova`)
5. **Editar Pagamento** (`/pagamentos-receber/:id/edit`)

## 🧪 Como Testar

### 1. **Verificar Console**
```javascript
// No console do navegador, deve aparecer:
🌍 [Timezone] Configurado para São Paulo: {
  timezone: "America/Sao_Paulo",
  timestamp: "2024-01-XX...",
  localTime: "XX/XX/XXXX XX:XX:XX"
}
```

### 2. **Testar Componentes de Data**
- Acesse qualquer formulário com campo de data
- Verifique se as datas são exibidas no formato brasileiro
- Confirme que o calendário abre corretamente

### 3. **Verificar Formatação**
- Datas devem aparecer como: `25/01/2024`
- Horários devem considerar o fuso de São Paulo

## 🔍 Troubleshooting

### Problema: Datas aparecem em formato americano
**Solução**: Verificar se o `DatePicker` está importando corretamente o `TIMEZONE`

### Problema: Horário incorreto
**Solução**: Verificar se `setupSaoPauloTimezone()` está sendo chamado no `main.tsx`

### Problema: Erro de timezone no build
**Solução**: Verificar se as configurações no `vite.config.ts` estão corretas

## 📝 Notas Importantes

1. **Horário de Verão**: O timezone `America/Sao_Paulo` já considera automaticamente o horário de verão brasileiro
2. **Consistência**: Todos os componentes de data devem usar o `DatePicker` padronizado
3. **Performance**: As configurações são aplicadas uma vez na inicialização da aplicação
4. **Compatibilidade**: Funciona tanto em desenvolvimento quanto em produção

## 🚀 Benefícios

- ✅ **Consistência**: Todas as datas seguem o mesmo padrão
- ✅ **Usabilidade**: Interface familiar para usuários brasileiros
- ✅ **Precisão**: Horário correto independente do servidor
- ✅ **Manutenibilidade**: Configuração centralizada e fácil de atualizar










































