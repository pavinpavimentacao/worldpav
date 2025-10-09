# 🚀 Quick Start - Programação de Pavimentação

## 📋 Rotas Disponíveis

### Listagem com Calendário Visual
```
http://localhost:5173/programacao
```
**Calendário semanal interativo** com exportação PDF otimizada!

### Criar Nova Programação
```
http://localhost:5173/programacao/nova
```
**Formulário moderno** com validação completa.

---

## 🎨 Calendário Visual (NOVO!)

### Características
- ✅ **Timeline semanal** com navegação por setas
- ✅ **7 programações mockadas** para exemplo
- ✅ **Exportação PDF em 1 clique** (hover no dia + ícone download)
- ✅ **Código de cores** por status
- ✅ **Animações fluidas** com Framer Motion
- ✅ **Estatísticas em tempo real**

### Como Usar o Calendário

#### Ver Programações
1. Acesse `/programacao`
2. Visualize a semana atual automaticamente
3. Navegue entre semanas com as setas `<` `>`
4. Clique em "Hoje" para voltar à semana atual

#### Exportar PDF do Dia
1. **Passe o mouse** sobre um dia que tenha programações
2. Clique no **ícone de download** (📥) que aparece
3. PDF será gerado automaticamente com:
   - Header profissional
   - Resumo estatístico
   - Todas as programações do dia
   - Código de cores mantido

---

## 🎯 Como usar o Formulário (Nova Programação)

### 1️⃣ Acessar a página

```
http://localhost:5173/programacao/nova
```

---

### 2️⃣ Preencher o formulário

#### Dados Básicos
1. **Equipe** → Selecione uma das equipes disponíveis
2. **Cliente** → Selecione um cliente
3. **Obra** → Após selecionar o cliente, escolha a obra (filtro dinâmico!)
4. **Localização** → Digite o endereço ou referência da obra

#### Maquinários
- Clique nos **cards de maquinários** para selecioná-los
- Você pode selecionar quantos precisar
- Os cards selecionados ficam com destaque azul ✨

#### Período da Obra
- Clique na **primeira data** (início)
- Clique na **segunda data** (fim)
- O período aparecerá destacado no calendário

---

### 3️⃣ Criar Programação

Clique no botão **"Criar Programação"** ao final do formulário.

Uma notificação de sucesso aparecerá e os dados serão exibidos no console do navegador.

---

## 📱 Responsividade

### Desktop
- Layout em 2 colunas para campos básicos
- Grid de 3 colunas para maquinários
- Calendário centralizado com largura fixa

### Mobile
- Todos os campos em coluna única
- Cards de maquinários empilhados
- Calendário ocupa toda a largura

---

## 🎨 Diferencial de UX

### Animações suaves
- **Entrada:** Cada seção aparece com fade in + slide up
- **Seleção:** Cards de maquinários têm animação de rotação ao selecionar
- **Hover:** Feedback visual ao passar o mouse
- **Tap:** Feedback tátil em mobile

### Interações inteligentes
- **Dropdown dinâmico:** Obras são filtradas automaticamente pelo cliente
- **Validação em tempo real:** Erros aparecem ao tentar submeter
- **Preview visual:** Período selecionado é exibido abaixo do calendário
- **Contador:** Quantidade de maquinários selecionados no título da seção

---

## 🧪 Dados de Teste

Use os seguintes dados mockados para testar:

### Equipes
- Equipe A
- Equipe B
- Equipe C

### Clientes
- **Prefeitura Municipal** → Obras: Avenida Brasil, Rua das Flores, Via Expressa Norte
- **Construtora Alfa** → Obras: Condomínio Sol, Residencial Vila Nova
- **Construtora Beta** → Obras: Distrito Industrial, Parque Empresarial

### Maquinários (6 disponíveis)
- Vibroacabadora
- Rolo Pneumático
- Caminhão Pipa
- Fresadora
- Rolo Compactador
- Escavadeira

---

## 🔍 Preview de Desenvolvimento

Ao final da página, há um card com **preview em JSON** mostrando em tempo real:
- Dados do formulário
- Maquinários selecionados
- Período escolhido

Use isso para debug e validação! 👨‍💻

---

## ✅ Checklist de Teste

Antes de integrar com o backend, teste:

- [ ] Seleção de equipe
- [ ] Seleção de cliente
- [ ] Dropdown de obras filtra corretamente
- [ ] Campo de localização aceita texto
- [ ] Cards de maquinários podem ser selecionados/desmarcados
- [ ] Calendário permite selecionar um período
- [ ] Período selecionado é exibido corretamente
- [ ] Validação funciona (tente submeter sem preencher)
- [ ] Mensagem de sucesso aparece ao criar
- [ ] Preview JSON mostra os dados corretos
- [ ] Layout mobile está responsivo
- [ ] Animações funcionam suavemente

---

## 🐛 Problemas Conhecidos

### Nenhum! 🎉

Mas se encontrar algo, verifique:
1. Console do navegador (erros JS)
2. Dados mockados estão corretos
3. Todas as dependências foram instaladas

---

## 🎯 Próxima Etapa

**Integração com Supabase:**
1. Criar tabelas no banco de dados
2. Implementar service layer
3. Substituir dados mockados por queries reais
4. Adicionar página de listagem

Consulte `PROGRAMACAO_PAVIMENTACAO_MODULE.md` para detalhes técnicos da integração.

---

**Divirta-se testando! 🚀**

