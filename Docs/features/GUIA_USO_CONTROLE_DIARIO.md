# 📖 Guia de Uso - Controle Diário com Dados Simulados

## 🎯 Objetivo
Este guia mostra como usar a funcionalidade de Controle Diário com os dados simulados (mockups) já configurados.

---

## 🚀 Como Acessar

1. Navegue para: **Controle Diário** (`/controle-diario`)
2. Você verá 3 abas:
   - **Relação Diária** (Lista de presença)
   - **Diárias** (Pagamentos)
   - **Histórico** (Consultas passadas)

---

## ✅ Visualizando Relações Já Criadas

### Passo 1: Acessar a Aba "Relação Diária"
- Você verá **3 relações diárias** já mockadas
- Cada card mostra:
  - 📅 Data da relação
  - 👥 Nome da equipe
  - ✅ Quantidade de presentes
  - ❌ Quantidade de ausências

### Passo 2: Expandir para Ver Detalhes
- Clique em qualquer card para expandir
- Você verá:
  - **Colaboradores Presentes**: Grid com todos os presentes
  - **Ausências Registradas**: Lista detalhada com motivo de cada ausência

### Exemplo de Dados Disponíveis:

#### 📊 Relação 001 - 15/10/2025 (Equipe Alpha)
- ✅ **8 presentes**: João Silva, Maria Santos, Pedro Costa, Ana Paula, Carlos Eduardo, Fernanda Lima, Roberto Alves, Juliana Souza
- ❌ **2 ausências**:
  - Marcos Pereira (Atestado médico)
  - Patrícia Rocha (Falta)

#### 📊 Relação 002 - 16/10/2025 (Equipe Beta)
- ✅ **7 presentes**: Lucas Martins, Carla Dias, Ricardo Gomes, Beatriz Silva, André Santos, Gabriela Oliveira, Thiago Mendes
- ❌ **3 ausências**:
  - Renata Costa (Mudança para Equipe Gamma)
  - Paulo Henrique (Atestado de 3 dias)
  - Vanessa Lima (Falta)

#### 📊 Relação 003 - 17/10/2025 (Equipe Alpha)
- ✅ **10 presentes**: Todos presentes!
- ❌ **0 ausências**

---

## ➕ Criando Nova Relação Diária

### Passo 1: Clicar em "+ Nova Relação"
- Na aba "Relação Diária", clique no botão azul **"+ Nova Relação"**
- Você será redirecionado para `/controle-diario/nova-relacao`

### Passo 2: Preencher Dados
1. **Selecione a Data**: Padrão é hoje, mas você pode alterar
2. **Selecione a Equipe**: Escolha uma das equipes disponíveis:
   - Equipe Alpha
   - Equipe Beta
   - Equipe Gamma
   - Equipe Delta - Terceira

### Passo 3: Ver Colaboradores da Equipe
Ao selecionar uma equipe, **automaticamente aparecerão todos os colaboradores**:

#### 🔵 Equipe Alpha (eq-001) - 9 colaboradores
- João Silva Santos (Ajudante)
- Maria Aparecida Costa (Ajudante)
- Pedro Henrique Oliveira (Operador de Vibrador)
- Ana Paula Ferreira (Conferente Topográfica)
- *(e mais 5 colaboradores...)*

#### 🟢 Equipe Beta (eq-002) - 5+ colaboradores
- Carlos Eduardo Santos (Operador de Acabadora)
- Lúcia Helena Rodrigues (Rasteleira)
- Roberto Carlos Lima (Operador de Rolo Pneumático)
- *(e mais colaboradores...)*

### Passo 4: Marcar Presença/Ausência

#### ✅ **Todos vêm pré-selecionados (presentes)**
- Os colaboradores da equipe aparecem **já marcados** como presentes
- Isso economiza tempo: você só precisa desmarcar quem faltou

#### ❌ **Para registrar uma ausência:**
1. **Desmarque** o colaborador que faltou
2. Um modal aparecerá perguntando o motivo:
   - 🔴 **Falta** (Não justificada)
   - 🔵 **Atestado Médico** (Justificada)
   - 🟠 **Mudança de Equipe** (Foi trabalhar em outra equipe)
3. Se for mudança de equipe, selecione qual equipe
4. Adicione observações se necessário
5. Clique em **"Confirmar Ausência"**

### Passo 5: Adicionar Observações (Opcional)
- No campo "Observações do Dia", adicione informações relevantes:
  - "Trabalho noturno"
  - "Concluímos a Rua Principal"
  - "Chuva atrasou o início em 2 horas"

### Passo 6: Registrar a Relação
- Clique em **"Registrar Relação"**
- Uma mensagem de sucesso aparecerá
- Você será redirecionado de volta para a lista
- A nova relação aparecerá no topo da lista

---

## 🎨 Recursos Visuais

### 📊 Estatísticas em Tempo Real
- Ao selecionar equipe, 3 cards aparecem mostrando:
  - 👥 **Total** de colaboradores da equipe
  - ✅ **Presentes** (verde)
  - ❌ **Ausências** (vermelho)

### 🎨 Badges Coloridos por Tipo de Ausência
- 🔴 **Vermelho**: Falta
- 🔵 **Azul**: Atestado Médico
- 🟠 **Laranja**: Mudança de Equipe

### 💡 Dica Visual
- Colaboradores com **borda laranja** não pertencem originalmente àquela equipe
- Isso ajuda a identificar transferências temporárias

---

## 📝 Dados Disponíveis para Teste

### Equipes Mockadas:
1. **eq-001** - Equipe Alpha (Própria)
2. **eq-002** - Equipe Beta (Própria)
3. **eq-003** - Equipe Gamma (Própria)
4. **eq-004** - Equipe Delta - Terceira (Terceirizada)

### Colaboradores Mockados:
- **+30 colaboradores** distribuídos entre equipes
- Todos com dados completos:
  - Nome
  - Função
  - CPF
  - Telefone
  - E-mail
  - Equipe vinculada

### Tipos de Função Disponíveis:
- Ajudante
- Rasteleiro/Rasteleira
- Operador de Máquinas
- Operador de Rolo
- Operador de Vibroacabadora
- Encarregado de Obra
- Conferente Topográfica
- Motorista

---

## 🔍 Testando os Cenários

### Cenário 1: Dia Normal (Algumas Ausências)
1. Selecione "Equipe Alpha"
2. Deixe 8 marcados como presentes
3. Desmarque 2 colaboradores
4. Registre 1 como "Atestado" e 1 como "Falta"
5. Adicione observação: "Dia de trabalho normal"
6. Registre

### Cenário 2: Dia com Mudança de Equipe
1. Selecione "Equipe Beta"
2. Deixe 7 marcados
3. Desmarque 1 colaborador
4. Registre como "Mudança de Equipe" → Equipe Gamma
5. Adicione observação: "Transferido para obra em Campinas"
6. Registre

### Cenário 3: Dia Perfeito (Todos Presentes)
1. Selecione qualquer equipe
2. Deixe todos marcados
3. Adicione observação: "Dia produtivo, todos presentes!"
4. Registre

---

## ✨ Funcionalidades Testadas

- ✅ Listagem de relações diárias
- ✅ Visualização detalhada (expandir/colapsar)
- ✅ Criação de nova relação
- ✅ Seleção automática de colaboradores por equipe
- ✅ Registro de presença
- ✅ Registro de ausências com motivo
- ✅ Mudança de equipe
- ✅ Observações gerais e específicas
- ✅ Estatísticas visuais em tempo real
- ✅ Layout responsivo
- ✅ Badges coloridos por status
- ✅ Navegação fluida

---

## 🐛 Solução de Problemas

### Não aparecem colaboradores ao selecionar equipe?
- ✅ **Resolvido!** Agora todos os colaboradores têm o campo `ativo: true`
- ✅ O filtro foi ajustado para buscar `equipe_a` e `equipe_b`
- ✅ Colaboradores estão vinculados às equipes através de `equipe_id`

### Modal não abre ao desmarcar colaborador?
- Certifique-se de que o colaborador **pertence** à equipe
- Somente colaboradores da equipe abrem o modal de ausência
- Colaboradores de outras equipes apenas são desmarcados

---

## 📚 Próximos Passos

Após testar com os mockups, você pode:

1. **Integrar com Supabase**: Substituir os mocks por dados reais
2. **Adicionar Filtros**: Por data, equipe, status
3. **Relatórios**: Exportar em PDF/Excel
4. **Notificações**: Alertas automáticos de ausências
5. **Análises**: Dashboard com estatísticas de presença

---

## 🎉 Pronto para Usar!

Agora você tem uma funcionalidade completa de Controle Diário com:
- ✅ Dados simulados realistas
- ✅ Interface intuitiva
- ✅ Layout profissional
- ✅ Fluxo completo de criação
- ✅ Visualização detalhada

**Divirta-se testando! 🚀**

