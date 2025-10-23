# 🧪 Guia de Teste - Colaboradores com Mocks

## ✅ Status Atual
- **Mocks Ativados**: ✅ Sim
- **Novas Abas**: ✅ Implementadas
- **Rotas**: ✅ Corrigidas
- **Upload de Arquivos**: ✅ Funcionando (simulado)

## 🚀 Como Testar

### 1. Acesse a Lista de Colaboradores
```
http://localhost:5173/colaboradores
```

### 2. Clique em "Detalhes" de qualquer colaborador
- Você verá as **5 novas abas reorganizadas**:
  - 👤 **Informações Pessoais** (dados básicos, profissionais e salário)
  - 📄 **Documentação** (RG, CNH, documentos pessoais)
  - 🏆 **Certificados & NR** (documentos NR + certificados unidos)
  - ⚖️ **Multas** (histórico de infrações expandido)
  - 📁 **Arquivos Gerais** (documentos diversos)

### 3. Teste as Funcionalidades

#### 👤 Aba Informações Pessoais
- ✅ Edite dados pessoais (nome, CPF, telefone, email)
- ✅ Configure dados profissionais (função, tipo contrato, data admissão)
- ✅ Ajuste informações financeiras (salário/diária)
- ✅ **Valores de pagamento sincronizados automaticamente** com salário fixo
- ✅ Configure vale transporte
- ✅ Auto-save em todos os campos

#### 📄 Aba Documentação
- ✅ Configure CNH (número, categoria, validade)
- ✅ Upload de documentos pessoais (RG, CPF, comprovante residência)
- ✅ Veja status dos documentos (🟢 Atualizado, 🔴 Vencido)
- ✅ Delete e reupload de documentos

#### 🏆 Aba Certificados & NR
- ✅ **Cards de resumo profissionais** com gradientes e ícones
- ✅ **Informações detalhadas** sobre validade em cada card
- ✅ **Status inteligente** (Nenhum cadastrado, Em conformidade, Atenção necessária)
- ✅ **Barra de progresso** nos cards mostrando status da validade
- ✅ **Modal de visualização** com anexo e informações completas
- ✅ Veja documentos NR com status visual em cards
- ✅ Upload de novos documentos NR
- ✅ Gerenciar datas de validade

#### ⚖️ Aba Multas (Expandido)
- ✅ **26 multas mockadas** distribuídas entre 20 colaboradores
- ✅ **Tipos variados**: Velocidade, estacionamento, álcool, CNH, etc.
- ✅ **Status diversificados**: Pagas, pendentes, em recurso
- ✅ **Valores realistas**: R$ 130 a R$ 2.934
- ✅ **Locais específicos**: Av. Paulista, Marginal Tietê, rodovias, etc.
- ✅ **Modal de visualização completo** com todos os detalhes e anexos
- ✅ Upload de comprovantes

#### 📁 Aba Arquivos Gerais
- ✅ Upload múltiplo (drag & drop)
- ✅ Veja lista de arquivos
- ✅ Delete arquivos

## 🎯 Colaboradores com Dados de Teste

### 1. João Silva Santos (ID: 1)
- **Dados**: Completos com CNH categoria D
- **Documentos**: Alguns vencidos (para testar alertas)
- **Multas**: Sem multas

### 2. Ricardo Henrique Machado (ID: 9)
- **Dados**: Operador de rolo, CNH categoria E
- **Documentos**: Completos (para testar status válido)
- **Multas**: 4 multas (3 pagas, 1 pendente) - R$ 130 a R$ 293

### 3. Fernando Cesar Ribeiro (ID: 15)
- **Dados**: Encarregado, CNH categoria B
- **Documentos**: Completos
- **Multas**: 3 multas (2 pagas, 1 em recurso) - Inclui multa grave de álcool R$ 2.934

### 4. Outros Colaboradores com Multas
- **Maria Silva (ID: 2)**: 1 multa pendente - Direção perigosa R$ 195
- **Pedro Santos (ID: 3)**: 1 multa paga - Uso de celular R$ 293
- **Ana Costa (ID: 4)**: 1 multa paga - Veículo em mau estado R$ 130
- **Carlos Oliveira (ID: 5)**: 1 multa em recurso - Não parar no semáforo R$ 293
- **Lucia Ferreira (ID: 6)**: 1 multa paga - Transitar pela contramão R$ 880
- **Roberto Lima (ID: 7)**: 1 multa pendente - Excesso de velocidade R$ 195
- **José Almeida (ID: 8)**: 1 multa paga - Estacionamento irregular R$ 293
- **Antonio Silva (ID: 10)**: 1 multa paga - Dirigir sem habilitação R$ 2.934
- **Francisco Pereira (ID: 11)**: 1 multa paga - Transporte irregular R$ 880
- **Manoel Rodrigues (ID: 12)**: 1 multa pendente - Não dar preferência R$ 195
- **Rafael Gomes (ID: 13)**: 1 multa paga - Luz alta urbana R$ 130
- **Diego Santos (ID: 14)**: 1 multa em recurso - Ultrapassagem proibida R$ 293
- **Gabriel Costa (ID: 16)**: 1 multa pendente - Velocidade leve R$ 130
- **Marcos Oliveira (ID: 17)**: 1 multa paga - Não usar seta R$ 195
- **Thiago Lima (ID: 18)**: 1 multa paga - Vaga especial R$ 293
- **Victor Almeida (ID: 19)**: 1 multa paga - CNH suspensa R$ 2.934
- **Leonardo Silva (ID: 20)**: 1 multa pendente - Sem licenciamento R$ 880

## 🔍 O que Observar

### ✅ Funcionalidades Testadas
- [x] Navegação entre abas
- [x] Auto-save nos campos
- [x] Upload simulado de arquivos
- [x] Status visual dos documentos
- [x] Validação de datas
- [x] Dropdowns funcionando
- [x] Toast de sucesso/erro
- [x] **Modal de visualização de multas** com anexos e detalhes completos

### 🎨 Design
- [x] Cards organizados
- [x] Ícones coloridos
- [x] Status visuais (cores)
- [x] Layout responsivo
- [x] Drag & drop funcional

## 🎯 Como Testar o Modal de Multas

### Teste Completo do Modal de Visualização:
1. **Acesse** a aba "Multas" de qualquer colaborador
2. **Clique no ícone de olho** 👁️ em qualquer multa da tabela
3. **Verifique se o modal abre** com:
   - ✅ **Visualizador de anexo** (PDF ou imagem)
   - ✅ **Status da multa** com cores e alertas
   - ✅ **Informações completas** (tipo, descrição, local, valores)
   - ✅ **Datas importantes** (infração, vencimento)
   - ✅ **Informações do sistema** (ID, registro, atualização)
   - ✅ **Botão de download** do comprovante
   - ✅ **Alertas de vencimento** (se aplicável)

### Colaboradores Recomendados para Teste:
- **João Silva (ID: 1)**: 2 multas com diferentes status
- **Ricardo (ID: 9)**: 4 multas variadas
- **Fernando (ID: 15)**: 3 multas incluindo multa grave de álcool

## 🐛 Se Algo Não Funcionar

### 1. Verifique o Console
Abra DevTools (F12) e veja se há erros:
```
✅ [MOCK] Colaborador carregado: João Silva Santos
✅ [MOCK] Documentos NR carregados: 3
```

### 2. Verifique as Rotas
Certifique-se que está em:
```
/colaboradores/1 (para João)
/colaboradores/9 (para Ricardo)
/colaboradores/15 (para Fernando)
```

### 3. Recarregue a Página
Se algo não carregar, pressione F5.

## 🔄 Ativando/Desativando Mocks

### Para Usar Mocks (Atual)
```typescript
// Em src/config/mock-config.ts
export const USE_MOCK = true;
```

### Para Usar Banco Real (Futuro)
```typescript
// Em src/config/mock-config.ts
export const USE_MOCK = false;
```

## 📝 Próximos Passos

Quando quiser ativar o banco real:

1. **Execute a migração SQL**:
   ```sql
   -- Execute o arquivo:
   db/migrations/add_colaboradores_detalhamento.sql
   ```

2. **Configure o Supabase Storage**:
   - Crie bucket `colaboradores-documentos`
   - Configure RLS policies

3. **Desative os mocks**:
   ```typescript
   export const USE_MOCK = false;
   ```

## 🎉 Resultado Esperado

Você deve ver uma interface moderna e funcional com:
- ✅ 5 abas organizadas
- ✅ Campos editáveis com auto-save
- ✅ Upload de arquivos funcionando
- ✅ Status visuais dos documentos
- ✅ Dados realistas para teste

---

**💡 Dica**: Teste especialmente os uploads e as datas de validade para ver os status coloridos funcionando!
