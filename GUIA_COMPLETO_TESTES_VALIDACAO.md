# 🧪 Guia Completo de Testes e Validação - WorldPav

**Versão:** 1.0  
**Data:** 02 de Novembro de 2025  
**Objetivo:** Documentar todos os testes necessários para validação completa do sistema

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Testes de Unidade](#2-testes-de-unidade)
3. [Testes de Integração](#3-testes-de-integração)
4. [Testes de Interface](#4-testes-de-interface)
5. [Testes de Performance](#5-testes-de-performance)
6. [Testes de Segurança](#6-testes-de-segurança)
7. [Testes de Usabilidade](#7-testes-de-usabilidade)
8. [Testes de Aceitação](#8-testes-de-aceitação)
9. [Checklist de Validação](#9-checklist-de-validação)
10. [Scripts de Teste Disponíveis](#10-scripts-de-teste-disponíveis)

---

## 1. Visão Geral

### 1.1 Objetivo dos Testes

Este guia fornece instruções detalhadas para realizar testes abrangentes em todos os módulos do sistema WorldPav, garantindo:

- ✅ Funcionamento correto de todas as funcionalidades
- ✅ Integridade de dados
- ✅ Segurança e isolamento entre empresas
- ✅ Performance adequada
- ✅ Experiência de usuário satisfatória

### 1.2 Níveis de Teste

| Nível | Descrição | Responsável | Quando Executar |
|-------|-----------|-------------|-----------------|
| **Unidade** | Teste de funções/componentes isolados | Desenvolvedor | Durante desenvolvimento |
| **Integração** | Teste de APIs e banco de dados | QA/Desenvolvedor | Após implementação |
| **Interface** | Teste de fluxos completos via UI | QA | Antes de release |
| **Performance** | Teste de velocidade e escalabilidade | QA/DevOps | Antes de produção |
| **Segurança** | Teste de vulnerabilidades e RLS | Security Team | Periodicamente |
| **Usabilidade** | Teste com usuários reais | Product/UX | Beta testing |
| **Aceitação** | Validação final com stakeholders | Product Owner | Antes do go-live |

### 1.3 Ambiente de Testes

#### Desenvolvimento
- **URL**: http://localhost:5173
- **Banco**: Supabase (projeto de dev)
- **Dados**: Mock/Teste

#### Staging
- **URL**: https://staging.worldpav.com
- **Banco**: Supabase (projeto staging)
- **Dados**: Cópia de produção (anonimizada)

#### Produção
- **URL**: https://app.worldpav.com
- **Banco**: Supabase (projeto produção)
- **Dados**: Dados reais

---

## 2. Testes de Unidade

### 2.1 Utilitários

#### Formatadores (`src/utils/formatters.ts`)

**Testes Necessários:**
```typescript
describe('formatCurrency', () => {
  test('formata valor positivo corretamente', () => {
    expect(formatCurrency(1000)).toBe('R$ 1.000,00')
  })
  
  test('formata valor negativo corretamente', () => {
    expect(formatCurrency(-500)).toBe('-R$ 500,00')
  })
  
  test('formata zero corretamente', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })
  
  test('lida com valores null/undefined', () => {
    expect(formatCurrency(null)).toBe('R$ 0,00')
  })
})

describe('formatDate', () => {
  test('formata data corretamente', () => {
    expect(formatDate('2025-01-15')).toBe('15/01/2025')
  })
  
  test('lida com data inválida', () => {
    expect(formatDate('invalid')).toBe('-')
  })
})

describe('formatCPF', () => {
  test('formata CPF com 11 dígitos', () => {
    expect(formatCPF('12345678900')).toBe('123.456.789-00')
  })
  
  test('lida com CPF já formatado', () => {
    expect(formatCPF('123.456.789-00')).toBe('123.456.789-00')
  })
})
```

#### Validadores (`src/utils/validators.ts`)

**Testes Necessários:**
```typescript
describe('CPF Validator', () => {
  test('valida CPF correto', () => {
    expect(validateCPF('123.456.789-00')).toBe(true)
  })
  
  test('invalida CPF incorreto', () => {
    expect(validateCPF('123.456.789-99')).toBe(false)
  })
  
  test('invalida CPF com dígitos repetidos', () => {
    expect(validateCPF('111.111.111-11')).toBe(false)
  })
})

describe('CNPJ Validator', () => {
  test('valida CNPJ correto', () => {
    expect(validateCNPJ('12.345.678/0001-00')).toBe(true)
  })
  
  test('invalida CNPJ incorreto', () => {
    expect(validateCNPJ('12.345.678/0001-99')).toBe(false)
  })
})
```

#### Cálculos de Obras (`src/utils/obra-calculations.ts`)

**Testes Necessários:**
```typescript
describe('Cálculo de Área', () => {
  test('calcula área corretamente', () => {
    expect(calculateArea(10, 5)).toBe(50) // length x width
  })
  
  test('retorna 0 para valores inválidos', () => {
    expect(calculateArea(0, 5)).toBe(0)
    expect(calculateArea(-10, 5)).toBe(0)
  })
})

describe('Cálculo de Faturamento', () => {
  test('calcula faturamento acumulado', () => {
    const medicoes = [
      { measured_value: 10000 },
      { measured_value: 15000 },
      { measured_value: 20000 }
    ]
    expect(calculateTotalFaturamento(medicoes)).toBe(45000)
  })
})
```

### 2.2 Hooks Customizados

#### useViaCep (`src/hooks/useViaCep.ts`)

**Testes Necessários:**
```typescript
describe('useViaCep', () => {
  test('busca CEP válido e retorna dados', async () => {
    const { result } = renderHook(() => useViaCep())
    act(() => {
      result.current.fetchCep('01001000')
    })
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
      expect(result.current.data.cidade).toBe('São Paulo')
    })
  })
  
  test('retorna erro para CEP inválido', async () => {
    const { result } = renderHook(() => useViaCep())
    act(() => {
      result.current.fetchCep('00000000')
    })
    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })
})
```

### 2.3 Componentes Isolados

#### Button Component

**Testes Necessários:**
```typescript
describe('Button', () => {
  test('renderiza com texto correto', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  test('chama onClick quando clicado', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  test('está desabilitado quando disabled=true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByText('Click')).toBeDisabled()
  })
})
```

---

## 3. Testes de Integração

### 3.1 Contas a Pagar

**Script:** `scripts/testing/test-contas-pagar-integracao.js`

**Como Executar:**
```bash
node scripts/testing/test-contas-pagar-integracao.js
```

**Testes Incluídos:**
1. ✅ Verificação da estrutura da tabela
2. ✅ Listagem de contas
3. ✅ Filtro por status
4. ✅ Cálculo de estatísticas
5. ⚠️ Criação de conta (RLS esperado)
6. ⚠️ Edição de conta (RLS esperado)
7. ⚠️ Exclusão de conta (RLS esperado)
8. ⚠️ Upload de anexo (RLS esperado)

**Resultado Esperado:**
- 4/8 testes passam (estrutura e leitura)
- 4/8 bloqueados por RLS (comportamento correto de segurança)

**Validação Manual via Interface:**
```
1. Login no sistema
2. Navegar para /contas-pagar
3. Clicar em "Nova Conta"
4. Preencher:
   - Fornecedor: "Fornecedor Teste"
   - Valor: 5000
   - Vencimento: data futura
   - Categoria: "Serviços"
5. Upload de nota fiscal (PDF ou imagem)
6. Salvar
7. Verificar se aparece na listagem
8. Editar conta criada
9. Alterar status para "Pago"
10. Verificar estatísticas atualizadas
11. Excluir conta
12. Confirmar exclusão (soft delete)
```

### 3.2 Recebimentos

**Scripts:**
- `scripts/testing/test-recebimentos-real.js`
- `scripts/testing/verificar-notas-obra.js`
- `scripts/testing/verificar-todas-notas-reais.js`

**Como Executar:**
```bash
node scripts/testing/test-recebimentos-real.js
node scripts/testing/verificar-notas-obra.js
node scripts/testing/verificar-todas-notas-reais.js
```

**Testes Incluídos:**
1. ✅ API `getAllNotasFiscais()` retorna dados
2. ✅ API `getNotasFiscaisPorObra()` filtra corretamente
3. ✅ Notas aparecem em /recebimentos
4. ✅ KPIs calculam corretamente
5. ✅ Modal de detalhes funciona
6. ✅ Filtros funcionam

**Validação Manual via Interface:**
```
1. Criar obra ou usar existente
2. Acessar detalhes da obra
3. Ir para aba "Notas Fiscais"
4. Criar nova nota fiscal:
   - Número: "NF-001"
   - Valor Bruto: 100000
   - Desconto INSS: 1100
   - Desconto ISS: 2000
   - Outros Descontos: 500
   - Vencimento: data futura
5. Salvar
6. Navegar para /recebimentos
7. Verificar se nota aparece
8. Conferir KPIs:
   - Total Recebimentos: deve incluir nova nota
   - Pendentes: deve incluir nova nota
   - Vencidos: 0 se vencimento futuro
9. Clicar em "Ver Detalhes"
10. Conferir informações completas
11. Fechar modal
12. Testar filtros (status, data)
```

### 3.3 Controle Diário

**Scripts:**
- `scripts/testing/test-diaria-real.js`
- `teste-relacao-diaria.js`

**Como Executar:**
```bash
node scripts/testing/test-diaria-real.js
```

**Validação Manual via Interface:**
```
1. Navegar para /controle-diario
2. Clicar em "Nova Relação Diária"
3. Selecionar data
4. Selecionar obra (opcional)
5. Adicionar colaborador:
   - Buscar colaborador existente
   - Definir valor da diária: 150
   - Adicionar horas extras: 3
   - Definir valor hora extra: 25
   - Sistema deve calcular: total_horas_extras = 3 × 25 = 75
6. Adicionar multa (se aplicável): 10
7. Adicionar outros descontos: 5
8. Sistema deve calcular total líquido:
   - 150 (diária) + 75 (H.E.) - 10 (multa) - 5 (desconto) = 210
9. Salvar
10. Verificar na listagem
11. Editar relação
12. Adicionar mais colaboradores
13. Marcar como "Pago"
14. Exportar relatório (se disponível)
```

### 3.4 Programação de Pavimentação

**Script:** `scripts/testing/test-programacao.js`

**Validação Manual via Interface:**
```
1. Criar equipes customizadas (se ainda não existem):
   - Navegar para /equipes
   - Criar "Equipe A - Pavimentação"
   - Criar "Equipe B - Máquinas"
2. Navegar para /programacao-pavimentacao
3. Visualizar calendário
4. Clicar em uma data futura
5. Criar nova programação:
   - Selecionar obra
   - Selecionar equipe customizada
   - Selecionar turno (manhã/tarde/noite)
   - Adicionar equipamentos
   - Adicionar observações
6. Salvar
7. Verificar se aparece no calendário
8. Testar drag-and-drop:
   - Arrastar programação para outra data
   - Verificar atualização
9. Editar programação
10. Alterar status (programado → andamento → concluído)
11. Verificar cores no calendário
12. Exportar programação (se disponível)
```

### 3.5 Obras

**Validação Completa de Obra:**
```
1. CRIAR OBRA:
   - Navegar para /obras/new
   - Selecionar cliente
   - Preencher dados:
     - Nome: "Obra Teste Pavimentação"
     - Endereço: "Rua Teste, 123"
     - Cidade/Estado
     - Data início
     - Data prevista conclusão
     - Valor contratual: 500000
   - Salvar
   
2. ADICIONAR RUAS:
   - Acessar detalhes da obra
   - Aba "Ruas/Etapas"
   - Adicionar rua:
     - Nome: "Rua A"
     - Comprimento: 100m
     - Largura: 8m
     - Sistema calcula área: 800m²
   - Adicionar mais 2 ruas
   - Verificar totalizadores
   
3. CRIAR MEDIÇÃO:
   - Aba "Medições"
   - Nova medição:
     - Número: 1
     - Data: hoje
     - Período: início obra até hoje
     - Valor medido: 100000
     - Sistema calcula percentual: 20% (de 500000)
   - Salvar
   
4. EMITIR NOTA FISCAL:
   - Aba "Notas Fiscais"
   - Nova nota:
     - Vincular com medição 1
     - Número: "NF-001"
     - Valor bruto: 100000
     - Descontos:
       - INSS: 1100
       - ISS: 2000
       - Outros: 500
     - Sistema calcula líquido: 96400
   - Upload de PDF (opcional)
   - Salvar
   
5. REGISTRAR PAGAMENTO DIRETO:
   - Aba "Financeiro"
   - Novo pagamento:
     - Descrição: "Material comprado"
     - Valor: 15000
     - Data: hoje
     - Categoria: "Material"
     - Fornecedor: "Fornecedor X"
   - Salvar
   
6. VERIFICAR RESUMO:
   - Aba "Resumo" ou página inicial da obra
   - Conferir:
     - Valor contratual: 500000
     - Valor executado: atualizado
     - Faturamento: 96400 (nota fiscal líquida)
     - Saldo: calculado
```

### 3.6 Colaboradores

**Validação Completa:**
```
1. CRIAR COLABORADOR:
   - Navegar para /colaboradores/new
   - Preencher dados pessoais:
     - Nome completo
     - CPF (validado)
     - RG
     - Data nascimento
     - Email
     - Telefone
   - Endereço:
     - CEP (busca automática via ViaCEP)
     - Complemento
   - Dados profissionais:
     - Função: "Operador de Máquina"
     - Tipo equipe: "Máquinas"
     - Equipe customizada: selecionar
     - Status: "Ativo"
     - Data contratação
   - Upload foto (opcional)
   - Salvar
   
2. ADICIONAR DOCUMENTOS:
   - Acessar detalhes do colaborador
   - Aba "Documentos"
   - Upload documentos:
     - RG (frente e verso)
     - CPF
     - CNH
     - Certificados
   - Definir data validade (se aplicável)
   - Salvar
   
3. VINCULAR COM EQUIPE:
   - Editar colaborador
   - Selecionar equipe customizada
   - Salvar
   
4. USAR EM DIÁRIAS:
   - Criar relação diária
   - Buscar colaborador criado
   - Adicionar à relação
   - Verificar vinculação
```

### 3.7 Maquinários

**Validação Completa:**
```
1. CRIAR MAQUINÁRIO:
   - Navegar para /maquinarios/new
   - Preencher:
     - Nome: "Rolo Compactador 1"
     - Tipo: "Rolo Compactador"
     - Marca: "Dynapac"
     - Modelo: "CA250D"
     - Placa: "ABC-1234"
     - Ano: 2020
     - Status: "Ativo"
   - Upload foto
   - Salvar
   
2. ADICIONAR SEGURO:
   - Acessar detalhes
   - Aba "Seguros"
   - Novo seguro:
     - Seguradora: "Seguradora X"
     - Número apólice: "123456"
     - Tipo cobertura: "Compreensivo"
     - Valor cobertura: 250000
     - Valor prêmio: 5000
     - Data início
     - Data fim (1 ano)
   - Upload apólice (PDF)
   - Salvar
   
3. ADICIONAR LICENÇA:
   - Aba "Licenças"
   - Nova licença:
     - Tipo: "CRLV"
     - Número documento
     - Data emissão
     - Data vencimento
   - Upload documento
   - Salvar
   
4. REGISTRAR ABASTECIMENTO:
   - Aba "Diesel"
   - Novo abastecimento:
     - Data: hoje
     - Litros: 100
     - Preço por litro: 5.50
     - Total: calculado automaticamente (550)
     - Hodômetro: 1500h
     - Posto: "Posto X"
     - Obra: vincular (opcional)
   - Salvar
   
5. VERIFICAR CONSUMO:
   - Visualizar histórico
   - Conferir médias de consumo
   - Exportar relatório
```

---

## 4. Testes de Interface

### 4.1 Navegação

**Checklist:**
- [ ] Sidebar abre e fecha corretamente
- [ ] Todos os links do menu funcionam
- [ ] Breadcrumbs mostram caminho correto
- [ ] Voltar do navegador funciona
- [ ] Links "Voltar" em páginas funcionam
- [ ] Menu mobile (hamburger) funciona
- [ ] Bottom tabs mobile funcionam

### 4.2 Formulários

**Checklist para TODOS os formulários:**
- [ ] Campos obrigatórios validam
- [ ] Mensagens de erro aparecem
- [ ] Validações de formato funcionam (CPF, email, etc)
- [ ] Máscaras de input funcionam (CPF, telefone, moeda)
- [ ] Upload de arquivos valida tipo
- [ ] Upload limita tamanho
- [ ] Preview de imagens funciona
- [ ] Campos dependentes atualizam (ex: CEP → Cidade/Estado)
- [ ] Botão salvar desabilita durante envio
- [ ] Loading state aparece
- [ ] Toast de sucesso aparece
- [ ] Toast de erro aparece
- [ ] Formulário limpa após sucesso (ou redireciona)

### 4.3 Listagens

**Checklist para TODAS as listagens:**
- [ ] Dados carregam corretamente
- [ ] Loading state aparece
- [ ] Empty state aparece quando sem dados
- [ ] Paginação funciona (se aplicável)
- [ ] Busca/filtro funciona
- [ ] Ordenação funciona (se aplicável)
- [ ] Botão "Novo" funciona
- [ ] Botão "Editar" funciona
- [ ] Botão "Excluir" funciona
- [ ] Modal de confirmação aparece na exclusão
- [ ] Exclusão remove da lista (ou soft delete)
- [ ] Exportar funciona (Excel/PDF)

### 4.4 Dashboards

**Dashboard Principal:**
- [ ] KPIs carregam corretamente
- [ ] Valores são precisos
- [ ] Gráficos renderizam
- [ ] Gráficos são interativos
- [ ] Filtros de período funcionam
- [ ] Atualização automática funciona (se aplicável)
- [ ] Responsivo em mobile

**Dashboard Financeiro:**
- [ ] Receitas e despesas corretas
- [ ] Gráfico de fluxo de caixa funciona
- [ ] Filtros por obra funcionam
- [ ] Filtros por categoria funcionam
- [ ] Exportação funciona

### 4.5 Modais

**Checklist para TODOS os modais:**
- [ ] Abre corretamente
- [ ] Fecha com "X"
- [ ] Fecha com ESC
- [ ] Fecha clicando fora (se aplicável)
- [ ] Conteúdo renderiza corretamente
- [ ] Formulários dentro funcionam
- [ ] Botão de ação funciona
- [ ] Botão cancelar funciona

---

## 5. Testes de Performance

### 5.1 Lighthouse

**Como Executar:**
1. Abrir DevTools (F12)
2. Ir para aba "Lighthouse"
3. Configurar:
   - Mode: Navigation
   - Categories: Performance, Accessibility, Best Practices, SEO
   - Device: Desktop e Mobile
4. Executar

**Metas:**
| Categoria | Objetivo |
|-----------|----------|
| Performance | > 90 |
| Accessibility | > 90 |
| Best Practices | > 90 |
| SEO | > 90 |

**Métricas Específicas:**
| Métrica | Objetivo |
|---------|----------|
| FCP (First Contentful Paint) | < 1.8s |
| LCP (Largest Contentful Paint) | < 2.5s |
| TBT (Total Blocking Time) | < 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| SI (Speed Index) | < 3.4s |

### 5.2 Network

**Como Testar:**
1. Abrir DevTools → Network
2. Simular conexão lenta:
   - Fast 3G
   - Slow 3G
   - Offline (para PWA)
3. Recarregar página
4. Analisar:
   - Tamanho total de recursos
   - Número de requisições
   - Tempo de carregamento
   - Recursos bloqueando renderização

**Metas:**
- **Tamanho total**: < 3MB em carregamento inicial
- **Número de requests**: < 50 em carregamento inicial
- **Tempo em 4G**: < 3s
- **Tempo em 3G**: < 5s

### 5.3 Bundle Size

**Como Analisar:**
```bash
npm run build
npx vite-bundle-visualizer
```

**Verificar:**
- [ ] Chunks estão sendo gerados (code splitting)
- [ ] Nenhuma biblioteca muito grande no bundle principal
- [ ] Lazy loading funcionando
- [ ] Tree shaking efetivo

### 5.4 Testes de Carga

**Usando k6 ou Artillery:**
```javascript
// Exemplo com k6
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // ramp up
    { duration: '5m', target: 100 }, // stay at 100 users
    { duration: '1m', target: 0 },   // ramp down
  ],
};

export default function () {
  let res = http.get('https://app.worldpav.com/api/obras');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

---

## 6. Testes de Segurança

### 6.1 Row Level Security (RLS)

**Script Manual de Teste:**

```sql
-- 1. Criar empresa de teste 1
INSERT INTO companies (id, name) VALUES ('company-1', 'Empresa Teste 1');

-- 2. Criar empresa de teste 2
INSERT INTO companies (id, name) VALUES ('company-2', 'Empresa Teste 2');

-- 3. Criar usuário 1 (empresa 1)
INSERT INTO auth.users (id, email, company_id) 
VALUES ('user-1', 'user1@test.com', 'company-1');

-- 4. Criar usuário 2 (empresa 2)
INSERT INTO auth.users (id, email, company_id) 
VALUES ('user-2', 'user2@test.com', 'company-2');

-- 5. Criar obra para empresa 1
INSERT INTO obras (id, company_id, name, client_id)
VALUES ('obra-1', 'company-1', 'Obra Empresa 1', 'client-1');

-- 6. Criar obra para empresa 2
INSERT INTO obras (id, company_id, name, client_id)
VALUES ('obra-2', 'company-2', 'Obra Empresa 2', 'client-2');

-- 7. Tentar acessar como user-1 (deve retornar apenas obra-1)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-1';
SELECT * FROM obras; -- Deve retornar apenas obra-1

-- 8. Tentar acessar como user-2 (deve retornar apenas obra-2)
SET LOCAL request.jwt.claim.sub TO 'user-2';
SELECT * FROM obras; -- Deve retornar apenas obra-2

-- 9. Tentar inserir obra em outra empresa (deve falhar)
SET LOCAL request.jwt.claim.sub TO 'user-1';
INSERT INTO obras (company_id, name) 
VALUES ('company-2', 'Tentativa Invasão'); -- DEVE FALHAR

-- 10. Tentar atualizar obra de outra empresa (deve falhar)
UPDATE obras SET name = 'Hackeado' WHERE id = 'obra-2'; -- DEVE FALHAR
```

**Resultado Esperado:**
- ✅ Usuário vê apenas dados de sua empresa
- ✅ Usuário não consegue inserir dados em outra empresa
- ✅ Usuário não consegue atualizar dados de outra empresa
- ✅ Usuário não consegue deletar dados de outra empresa

### 6.2 Upload de Arquivos

**Testes de Segurança:**
```
1. Tentar upload de arquivo executável (.exe):
   - Deve ser bloqueado
   
2. Tentar upload de script (.js, .php):
   - Deve ser bloqueado se não for tipo aceito
   
3. Tentar upload de arquivo muito grande (> 10MB):
   - Deve ser bloqueado
   
4. Tentar upload com nome malicioso (../../etc/passwd):
   - Nome deve ser sanitizado
   
5. Tentar acessar arquivo de outra empresa:
   - URL deve ser protegida (storage policies)
```

### 6.3 SQL Injection

**Testes (devem todos falhar em injetar):**
```
1. Campo de busca: ' OR 1=1 --
2. Campo de busca: '; DROP TABLE obras; --
3. Campo de busca: ' UNION SELECT * FROM users --
4. Filtro de status: 'pendente' OR '1'='1
```

**Resultado Esperado:**
- ✅ Todas as tentativas falham (queries parametrizadas)
- ✅ Nenhum erro de SQL exposto ao usuário

### 6.4 XSS (Cross-Site Scripting)

**Testes:**
```
1. Inserir em campo de texto:
   <script>alert('XSS')</script>
   
2. Inserir em campo de observações:
   <img src=x onerror=alert('XSS')>
   
3. Inserir em nome de arquivo:
   <svg onload=alert('XSS')>
```

**Resultado Esperado:**
- ✅ Scripts não executam (React escapa automaticamente)
- ✅ HTML é exibido como texto

### 6.5 CSRF (Cross-Site Request Forgery)

**Teste:**
1. Fazer requisição de domínio externo
2. Verificar se CORS bloqueia
3. Verificar se token CSRF é exigido

**Resultado Esperado:**
- ✅ Requisições de origem externa bloqueadas
- ✅ Tokens CSRF validados

### 6.6 Autenticação

**Testes:**
```
1. Acessar rota protegida sem login:
   - Deve redirecionar para /login
   
2. Token JWT expirado:
   - Deve renovar automaticamente
   - Ou redirecionar para login se refresh falhar
   
3. Token JWT inválido:
   - Deve rejeitar e redirecionar para login
   
4. Logout:
   - Deve limpar sessão completamente
   - Deve redirecionar para login
   - Tentar acessar rota protegida deve falhar
```

---

## 7. Testes de Usabilidade

### 7.1 Teste com Usuários Reais

**Protocolo de Teste:**

**Participantes:**
- 5-10 usuários representativos de cada persona
- Gestores, coordenadores, financeiro, campo

**Tarefas a Executar:**
1. **Criar uma obra completa** (tempo esperado: 5 min)
2. **Programar equipe para obra** (tempo esperado: 2 min)
3. **Registrar relatório diário** (tempo esperado: 3 min)
4. **Emitir nota fiscal** (tempo esperado: 3 min)
5. **Criar conta a pagar** (tempo esperado: 2 min)
6. **Encontrar informação específica no dashboard** (tempo esperado: 1 min)
7. **Exportar relatório** (tempo esperado: 1 min)

**Métricas a Coletar:**
- **Task Success Rate**: % de usuários que completam cada tarefa
- **Time on Task**: Tempo médio para completar
- **Error Rate**: Número de erros cometidos
- **Satisfaction**: Escala de 1-10 após cada tarefa
- **SUS (System Usability Scale)**: Questionário padrão de usabilidade

**Observações:**
- Gravar tela e áudio (com consentimento)
- Pedir usuário para "pensar alto"
- Não ajudar a menos que usuário fique travado
- Anotar frustrações e sugestões

### 7.2 Acessibilidade

**Testes Manuais:**
```
1. Navegação por teclado:
   - Tab/Shift+Tab navega na ordem correta
   - Enter ativa botões
   - Esc fecha modais
   - Setas navegam em dropdowns
   
2. Leitores de tela (NVDA/JAWS/VoiceOver):
   - Todos os elementos são lidos
   - Labels estão associados aos inputs
   - Botões têm textos descritivos
   - Imagens têm alt text
   
3. Contraste de cores:
   - Mínimo 4.5:1 para texto normal
   - Mínimo 3:1 para texto grande
   - Usar ferramenta: WebAIM Contrast Checker
   
4. Zoom:
   - Página funciona com 200% de zoom
   - Texto não sobrepõe
   - Botões permanecem clicáveis
```

**Ferramentas Automáticas:**
- **axe DevTools**: Extensão do Chrome
- **WAVE**: Extensão do Chrome
- **Lighthouse**: Auditoria de acessibilidade

### 7.3 Responsividade

**Dispositivos a Testar:**

| Dispositivo | Resolução | O que Testar |
|-------------|-----------|--------------|
| Desktop HD | 1920x1080 | Layout completo |
| Desktop | 1366x768 | Layout completo |
| Tablet (iPad) | 1024x768 | Layout responsivo |
| Tablet (iPad) Retrato | 768x1024 | Layout mobile |
| Mobile Grande (iPhone Plus) | 414x736 | Layout mobile |
| Mobile Médio (iPhone) | 375x667 | Layout mobile |
| Mobile Pequeno (iPhone SE) | 320x568 | Layout mobile mínimo |

**Checklist:**
- [ ] Sidebar vira menu hamburger em mobile
- [ ] Tabelas viram cards em mobile
- [ ] Formulários ficam em coluna única em mobile
- [ ] Botões ficam empilhados em mobile
- [ ] Imagens redimensionam
- [ ] Texto não quebra layout
- [ ] Touch targets têm 44x44px mínimo
- [ ] Bottom navigation aparece em mobile

---

## 8. Testes de Aceitação

### 8.1 Critérios de Aceitação

#### Gestão de Obras
```
DADO que sou um gestor
QUANDO eu crio uma nova obra
ENTÃO devo poder:
  - Vincular com cliente existente
  - Definir datas de início e fim (ou sem previsão)
  - Definir valor contratual
  - Adicionar múltiplas ruas/etapas
  - Registrar medições parciais
  - Emitir notas fiscais vinculadas
  - Visualizar resumo financeiro consolidado
```

#### Controle Diário
```
DADO que sou um coordenador
QUANDO eu registro uma relação diária
ENTÃO devo poder:
  - Adicionar múltiplos colaboradores
  - Definir valor de diária individual
  - Registrar horas extras com cálculo automático
  - Aplicar multas e descontos
  - Ver total líquido calculado automaticamente
  - Marcar como "pago" posteriormente
  - Exportar para contabilidade
```

#### Programação
```
DADO que sou um coordenador
QUANDO eu programo uma equipe
ENTÃO devo poder:
  - Selecionar equipe customizada
  - Definir obra, data e turno
  - Adicionar equipamentos
  - Ver programação no calendário visual
  - Arrastar e soltar para reprogramar
  - Alterar status da programação
  - Exportar programação semanal/mensal
```

#### Financeiro
```
DADO que sou do financeiro
QUANDO eu emito uma nota fiscal
ENTÃO devo poder:
  - Vincular com medição da obra
  - Definir valor bruto
  - Informar descontos (INSS, ISS, outros)
  - Ver valor líquido calculado automaticamente
  - Definir data de vencimento
  - Ver nota em "Recebimentos"
  - Acompanhar status de pagamento
```

### 8.2 User Acceptance Testing (UAT)

**Fase 1: Alpha Testing (Interno)**
- Equipe interna testa todas as funcionalidades
- Identificar e corrigir bugs críticos
- Validar fluxos completos
- Duração: 2 semanas

**Fase 2: Beta Testing (Usuários Piloto)**
- 3-5 empresas parceiras testam em produção
- Uso em cenários reais
- Feedback contínuo
- Suporte dedicado
- Duração: 4 semanas

**Fase 3: Go-Live**
- Correções de beta aplicadas
- Treinamento de usuários
- Migração de dados (se aplicável)
- Suporte intensivo nas primeiras semanas

---

## 9. Checklist de Validação

### 9.1 Pré-Deploy

**Backend:**
- [ ] Todas as migrações SQL executadas
- [ ] RLS habilitado em todas as tabelas
- [ ] Storage buckets criados
- [ ] Policies de storage configuradas
- [ ] Edge functions deployadas (se houver)
- [ ] Backup automático configurado

**Frontend:**
- [ ] Build de produção funciona (`npm run build`)
- [ ] Não há erros de console em produção
- [ ] Variáveis de ambiente de produção configuradas
- [ ] Service worker funcionando
- [ ] PWA instalável

**Segurança:**
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Logs não expõem dados sensíveis
- [ ] Validação de uploads funciona

### 9.2 Pós-Deploy

**Funcional:**
- [ ] Login funciona
- [ ] Todas as rotas carregam
- [ ] CRUD de todas as entidades funciona
- [ ] Uploads funcionam
- [ ] Downloads funcionam
- [ ] Exportações funcionam
- [ ] Notificações funcionam (se aplicável)

**Performance:**
- [ ] Lighthouse score > 90
- [ ] Carregamento < 3s em 4G
- [ ] Nenhum erro 500
- [ ] Nenhum timeout de API

**Monitoramento:**
- [ ] Configurar ferramenta de monitoramento (Sentry, LogRocket)
- [ ] Configurar alertas de erro
- [ ] Configurar alertas de performance
- [ ] Configurar analytics (Google Analytics, Mixpanel)

---

## 10. Scripts de Teste Disponíveis

### 10.1 Testes de Integração

**Contas a Pagar:**
```bash
node scripts/testing/test-contas-pagar-integracao.js
node scripts/testing/verificar-estrutura-contas-pagar.js
```

**Recebimentos:**
```bash
node scripts/testing/test-recebimentos-real.js
node scripts/testing/verificar-notas-obra.js
node scripts/testing/verificar-todas-notas-reais.js
```

**Diárias:**
```bash
node scripts/testing/test-diaria-real.js
node teste-relacao-diaria.js
```

**Programação:**
```bash
node scripts/testing/test-programacao.js
```

**Equipes:**
```bash
node scripts/testing/test-equipes.js
```

### 10.2 Scripts de Diagnóstico

**Banco de Dados:**
```bash
node scripts/database/verificar-estrutura-medicoes.js
node scripts/database/verificar-estrutura-notas.js
node scripts/database/verificar-todas-colunas.js
node scripts/database/verificar-dados-notas.js
```

**Equipes:**
```bash
node scripts/database/diagnosticar-equipes.sql
node scripts/database/verificar-equipes-dropdown.sql
node scripts/database/verificar-relatorio-equipe.sql
```

### 10.3 Scripts de Manutenção

**Correções:**
```bash
node scripts/utilities/corrigir-campos-notas-fiscais.js
node scripts/utilities/corrigir-estrutura-medicoes.js
node scripts/utilities/corrigir-tabelas-notas-ruas.js
```

---

## 11. Relatório de Testes

### 11.1 Template de Relatório

```markdown
# Relatório de Testes - WorldPav

**Data:** [Data]
**Versão Testada:** [Versão]
**Testador:** [Nome]
**Ambiente:** [Dev/Staging/Prod]

## Resumo Executivo
- Total de testes executados: X
- Testes passaram: Y (Z%)
- Testes falharam: W
- Bugs críticos encontrados: N
- Bugs médios encontrados: M
- Bugs menores encontrados: L

## Testes Executados

### Módulo: [Nome do Módulo]

| ID | Descrição | Status | Observações |
|----|-----------|--------|-------------|
| T-001 | Criar obra | ✅ PASS | - |
| T-002 | Editar obra | ❌ FAIL | Erro ao salvar endereço |
| T-003 | Excluir obra | ⚠️ SKIP | Não testado |

## Bugs Encontrados

### BUG-001: [Título]
- **Severidade:** Crítica/Média/Menor
- **Módulo:** [Módulo]
- **Passos para Reproduzir:**
  1. ...
  2. ...
- **Resultado Esperado:** ...
- **Resultado Obtido:** ...
- **Screenshots:** [links]

## Recomendações
1. ...
2. ...

## Conclusão
[Sumário final e decisão de go/no-go para produção]
```

### 11.2 Critérios de Aprovação

**Para aprovar para produção:**
- ✅ 95%+ de testes passando
- ✅ Zero bugs críticos
- ✅ Máximo 5 bugs médios
- ✅ Lighthouse score > 90
- ✅ SUS score > 70
- ✅ Todas as funcionalidades core funcionando
- ✅ RLS validado
- ✅ Performance adequada

---

## 12. Melhoria Contínua

### 12.1 Testes Automatizados (Roadmap)

**Jest + React Testing Library:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Estrutura:**
```
tests/
├── unit/
│   ├── utils/
│   ├── hooks/
│   └── components/
├── integration/
│   ├── api/
│   └── flows/
└── e2e/
    └── scenarios/
```

**E2E com Playwright:**
```bash
npm install --save-dev @playwright/test
```

### 12.2 CI/CD

**GitHub Actions (exemplo):**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run build
```

---

## 13. Conclusão

Este guia fornece uma estrutura completa para testar e validar todos os aspectos do sistema WorldPav. Use-o como referência durante todo o ciclo de desenvolvimento e manutenção do produto.

**Lembre-se:**
- Testes não são opcionais, são parte do desenvolvimento
- Automatize sempre que possível
- Teste continuamente, não apenas no final
- Envolva usuários reais o quanto antes
- Segurança é prioridade máxima

---

**Documento criado em:** 02 de Novembro de 2025  
**Última atualização:** 02 de Novembro de 2025  
**Versão:** 1.0

---

*Para dúvidas ou sugestões, contate a equipe de QA.*






