# 📝 Instruções: Implementação de Horas Extras

## ✅ Implementação Concluída

A funcionalidade de **Horas Extras** foi implementada com sucesso nos detalhes dos colaboradores.

## 🗄️ Migration do Banco de Dados

### Arquivo Criado
- `db/migrations/04c_colaboradores_horas_extras.sql`

### Como Aplicar a Migration

1. **Pelo Supabase Dashboard:**
   - Acesse o Supabase Dashboard
   - Vá em **SQL Editor**
   - Copie e cole o conteúdo do arquivo `db/migrations/04c_colaboradores_horas_extras.sql`
   - Execute a query

2. **Via CLI do Supabase:**
   ```bash
   supabase db push
   ```

## 📋 Estrutura da Tabela

```sql
CREATE TABLE public.colaboradores_horas_extras (
  id UUID PRIMARY KEY,
  colaborador_id UUID REFERENCES colaboradores(id),
  data DATE NOT NULL,
  horas DECIMAL(5, 2) NOT NULL,
  valor_calculado DECIMAL(10, 2) NOT NULL,
  tipo_dia tipo_dia_hora_extra NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tipo Dia Hora Extra (ENUM)
- **normal**: Dias úteis normais (+50%)
- **sabado**: Sábados (+50%)
- **domingo**: Domingos (+100%)
- **feriado**: Feriados (+100%)

## 🎨 Componentes Criados/Modificados

### 1. **HorasExtrasTab.tsx** (NOVO)
- Localização: `src/components/colaboradores/HorasExtrasTab.tsx`
- Funcionalidades:
  - Listagem de horas extras
  - Filtros por data
  - Estatísticas (total de registros, horas, valor)
  - Adicionar nova hora extra
  - Excluir hora extra

### 2. **HoraExtraForm.tsx** (ATUALIZADO)
- Localização: `src/components/forms/HoraExtraForm.tsx`
- Ajustes:
  - Corrigido tipos de dados
  - Atualizado cálculo de valores
  - Interface consistente com o banco

### 3. **ColaboradorDetalhes.tsx** (ATUALIZADO)
- Localização: `src/pages/colaboradores/ColaboradorDetalhes.tsx`
- Mudanças:
  - Adicionada nova aba "Horas Extras"
  - Importado componente `HorasExtrasTab`
  - Ícone: Clock (relógio)

### 4. **supabase.ts** (ATUALIZADO)
- Localização: `src/lib/supabase.ts`
- Mudanças:
  - Tipos atualizados para `colaboradores_horas_extras`
  - Enum: `'normal' | 'sabado' | 'domingo' | 'feriado'`

## 🧮 Cálculo de Horas Extras

O cálculo segue a seguinte lógica:

```typescript
const valorHoraNormal = salarioFixo / 220; // 220 horas por mês

Multiplicadores:
- normal: 1.5x (50% adicional)
- sabado: 1.5x (50% adicional)
- domingo: 2.0x (100% adicional)
- feriado: 2.0x (100% adicional)

valorHoraExtra = valorHoraNormal * multiplicador * horasExtras
```

## 🔒 Segurança (RLS)

As políticas de Row Level Security (RLS) foram configuradas para garantir que:
- Usuários só podem ver horas extras de colaboradores da sua empresa
- Usuários só podem adicionar/editar/excluir horas extras da sua empresa

## 🧪 Como Testar

1. Acesse um colaborador específico
2. Clique na aba "Horas Extras"
3. Clique em "Nova Hora Extra"
4. Preencha os dados:
   - Data
   - Quantidade de horas
   - Tipo de dia
5. Verifique o cálculo automático do valor
6. Salve e verifique se aparece na listagem

## 📊 Estatísticas Exibidas

A aba exibe:
- **Total de Registros**: Quantidade de lançamentos
- **Total de Horas**: Soma de todas as horas extras
- **Valor Total**: Soma do valor calculado de todas as horas extras

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar relatório de horas extras por período
- [ ] Integrar com folha de pagamento
- [ ] Exportar para PDF/Excel
- [ ] Notificações de aprovação de horas extras
- [ ] Dashboard de horas extras por equipe

## 📝 Observações

- A migration deve ser aplicada antes de usar a funcionalidade
- O salário fixo do colaborador é usado para calcular o valor da hora extra
- Se o colaborador não tiver salário definido, o valor será R$ 0,00
- Os registros são ordenados por data (mais recentes primeiro)



