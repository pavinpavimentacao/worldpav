# 🎭 Guia de Uso - Mockups de Colaboradores

**Data:** 09/10/2025  
**Objetivo:** Testar interface sem banco de dados

---

## 🎯 O Que São os Mockups?

Dados de exemplo (fake) que simulam colaboradores reais para você testar a interface **sem precisar aplicar o SQL no banco de dados**.

---

## 📦 Arquivos Criados

### 1. **Dados Mockados**
📄 `src/mocks/colaboradores-mock.ts`

Contém:
- ✅ 15 colaboradores da Equipe de Massa
- ✅ 4 colaboradores da Equipe Administrativa
- ✅ Dados completos (nome, CPF, email, salário, etc.)
- ✅ Funções auxiliares para busca e filtro

### 2. **Interface com Mocks**
📄 `src/pages/colaboradores/ColaboradoresListMock.tsx`

Versão da listagem que usa dados mockados:
- ✅ Totalmente funcional
- ✅ Filtros funcionando
- ✅ Busca funcionando
- ✅ Estatísticas reais dos mocks
- ✅ Modal de detalhes
- ✅ Visual idêntico à versão real

---

## 🚀 Como Usar os Mockups

### Opção 1: Via Rotas (Recomendado)

**1. Abra o arquivo de rotas:**
```bash
src/routes/index.tsx
```

**2. Adicione a importação:**
```typescript
import ColaboradoresListMock from '../pages/colaboradores/ColaboradoresListMock'
```

**3. Adicione a rota:**
```typescript
{
  path: '/colaboradores-mock',
  element: <ColaboradoresListMock />
}
```

**4. Acesse no navegador:**
```
http://localhost:5173/colaboradores-mock
```

### Opção 2: Substituir Temporariamente

**1. Abra o arquivo de rotas:**
```bash
src/routes/index.tsx
```

**2. Substitua temporariamente:**
```typescript
// ANTES (comentar)
// import ColaboradoresList from '../pages/colaboradores/ColaboradoresList'

// DEPOIS (usar)
import ColaboradoresList from '../pages/colaboradores/ColaboradoresListMock'
```

**3. Acesse normalmente:**
```
http://localhost:5173/colaboradores
```

---

## 📊 Dados Disponíveis nos Mocks

### 🏗️ Equipe de Massa (15 colaboradores)

| Função | Quantidade | Salário Médio |
|--------|-----------|---------------|
| Ajudante | 4 | R$ 2.500,00 |
| Rasteleiro | 4 | R$ 2.800,00 |
| Operador de Rolo Chapa Chapa | 1 | R$ 3.500,00 |
| Operador de Rolo Pneu Pneu | 1 | R$ 3.500,00 |
| Operador de VibroAcabadora | 1 | R$ 4.000,00 |
| Operador de Mesa da VibroAcabadora | 1 | R$ 3.200,00 |
| Motorista de Caminhão Espargidor | 1 | R$ 3.800,00 |
| Mangueirista | 1 | R$ 2.700,00 |
| Encarregado | 1 | R$ 4.500,00 |

### 🏢 Equipe Administrativa (4 colaboradores)

| Função | Quantidade | Salário |
|--------|-----------|---------|
| Financeiro | 1 | R$ 5.000,00 |
| RH | 1 | R$ 4.500,00 |
| Programador | 1 | R$ 4.000,00 |
| Admin | 1 | R$ 6.000,00 |

### 📊 Estatísticas

- **Total:** 19 colaboradores
- **Equipe de Massa:** 15
- **Equipe Administrativa:** 4
- **Registrados:** 15
- **Não Registrados:** 4
- **Contrato Fixo:** 15
- **Diaristas:** 4
- **Com Vale Transporte:** 16

---

## 🎨 Funcionalidades Disponíveis

### ✅ Cards de Estatísticas
- Total de colaboradores (19)
- Equipe de Massa (15)
- Equipe Administrativa (4)
- Registrados (15)

### ✅ Filtros Funcionais
- **Busca textual:** Nome, função, email, CPF
- **Por equipe:** Todas / Massa / Administrativa
- **Por contrato:** Todos / Fixo / Diarista

### ✅ Ações
- Ver detalhes (modal funcional)
- Editar (simulado com alert)
- Excluir (simulado com confirm)

### ✅ Visual
- Cores distintas por equipe
- Badges de status
- Responsivo
- Idêntico à versão real

---

## 🧪 Casos de Teste

### Teste 1: Visualizar Todos
1. Acesse `/colaboradores-mock`
2. Deve mostrar 19 colaboradores
3. Cards devem mostrar totais corretos

### Teste 2: Filtrar por Equipe
1. Selecione "Equipe de Massa"
2. Deve mostrar 15 colaboradores
3. Todos com badge laranja

### Teste 3: Filtrar por Contrato
1. Selecione "Diarista"
2. Deve mostrar 4 colaboradores
3. Todos com tipo "diarista"

### Teste 4: Buscar por Nome
1. Digite "Silva" na busca
2. Deve filtrar colaboradores com "Silva" no nome

### Teste 5: Ver Detalhes
1. Clique no ícone de olho
2. Modal deve abrir com dados completos
3. Fechar deve voltar à lista

### Teste 6: Combinar Filtros
1. Selecione "Equipe Administrativa"
2. Digite "Maria" na busca
3. Deve mostrar apenas "Maria Fernanda Santos"

---

## 📝 Helpers Disponíveis

O arquivo `colaboradores-mock.ts` exporta helpers úteis:

```typescript
// Buscar por ID
const colab = getColaboradorById('1')

// Filtrar por tipo de equipe
const massa = getColaboradoresByTipoEquipe('massa')
const admin = getColaboradoresByTipoEquipe('administrativa')

// Filtrar por função
const ajudantes = getColaboradoresByFuncao('Ajudante')

// Buscar por termo
const resultados = searchColaboradores('Silva')

// Estatísticas
console.log(mockColaboradoresStats)
```

---

## 🔄 Quando Migrar para Dados Reais

### 1. Execute o SQL
```bash
# Arquivo: db/migrations/add_tipo_equipe_colaboradores.sql
```

### 2. Remova ou Comente a Rota Mock
```typescript
// src/routes/index.tsx
// Remover ou comentar:
// {
//   path: '/colaboradores-mock',
//   element: <ColaboradoresListMock />
// }
```

### 3. Use o Componente Real
```typescript
// Usar:
import ColaboradoresList from '../pages/colaboradores/ColaboradoresList'
```

---

## 🎯 Diferenças Mock vs Real

| Recurso | Mock | Real |
|---------|------|------|
| **Dados** | Fixos (19) | Dinâmicos (Supabase) |
| **CRUD** | Simulado | Funcional |
| **Filtros** | ✅ Funciona | ✅ Funciona |
| **Busca** | ✅ Funciona | ✅ Funciona |
| **Formulário** | ❌ Alert | ✅ Modal real |
| **Persistência** | ❌ Não salva | ✅ Salva no banco |
| **Loading** | ❌ Instantâneo | ✅ Com loading |
| **Validações** | ❌ Básicas | ✅ Completas |

---

## 💡 Dicas

### Para Desenvolvedores

1. **Use mocks primeiro** para testar UI/UX
2. **Valide os filtros** antes de integrar com banco
3. **Teste responsividade** com dados mockados
4. **Ajuste cores e espaçamentos** sem depender do banco

### Para Demonstrações

1. **Não precisa de banco** para mostrar ao cliente
2. **Dados consistentes** (sempre os mesmos)
3. **Rápido** (sem latência de rede)
4. **Seguro** (não afeta dados reais)

### Para Testes

1. **Dados previsíveis** para testes automatizados
2. **Cobertura completa** de todas as funções
3. **Casos extremos** incluídos (sem email, sem CPF, etc.)

---

## 🐛 Troubleshooting

### Erro: "Cannot find module colaboradores-mock"
**Solução:** Verifique se o arquivo está em `src/mocks/colaboradores-mock.ts`

### Página em branco
**Solução:** Verifique o console do navegador (F12) para erros

### Filtros não funcionam
**Solução:** Limpe o cache do navegador (Ctrl+Shift+R)

### Cards mostram zeros
**Solução:** Verifique se está usando `mockColaboradoresStats` corretamente

---

## 📚 Exemplos de Código

### Importar e Usar Mocks

```typescript
import { 
  mockColaboradores,
  mockEquipeMassa,
  mockEquipeAdministrativa,
  mockColaboradoresStats,
  getColaboradorById
} from '../mocks/colaboradores-mock'

// Usar em componente
function MeuComponente() {
  const [colaboradores] = useState(mockColaboradores)
  const stats = mockColaboradoresStats
  
  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Equipe de Massa: {stats.equipeMassa}</p>
    </div>
  )
}
```

### Filtrar Mocks

```typescript
// Filtrar por equipe
const massa = mockColaboradores.filter(c => c.tipo_equipe === 'massa')

// Buscar por nome
const busca = mockColaboradores.filter(c => 
  c.nome.toLowerCase().includes('silva')
)

// Combinar filtros
const resultado = mockColaboradores.filter(c => 
  c.tipo_equipe === 'massa' && 
  c.tipo_contrato === 'fixo'
)
```

---

## ✅ Checklist de Uso

### Antes de Começar
- [ ] Arquivo `colaboradores-mock.ts` existe
- [ ] Arquivo `ColaboradoresListMock.tsx` existe
- [ ] Tipos `colaboradores.ts` criados
- [ ] Projeto rodando (`npm run dev`)

### Testando
- [ ] Acessar `/colaboradores-mock`
- [ ] Visualizar os 19 colaboradores
- [ ] Testar filtro por equipe
- [ ] Testar filtro por contrato
- [ ] Testar busca
- [ ] Ver detalhes de um colaborador
- [ ] Verificar responsividade

### Migrar para Real
- [ ] SQL aplicado no Supabase
- [ ] Componente real (`ColaboradoresList`) funcionando
- [ ] Rota mock removida ou desativada
- [ ] Testes com dados reais

---

## 🎉 Pronto!

Os mockups estão prontos para uso! Teste à vontade sem medo de quebrar nada.

**Acesso Rápido:**
```
Rota: /colaboradores-mock
Arquivo de Dados: src/mocks/colaboradores-mock.ts
Componente: src/pages/colaboradores/ColaboradoresListMock.tsx
```

---

**Desenvolvido com ❤️**  
**Data:** 09/10/2025


