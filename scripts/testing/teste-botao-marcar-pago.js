/**
 * Script de teste para verificar se o botão "Marcar como Pago" aparece
 * Execute este script no console do navegador após aplicar a migração
 */

console.log('🔍 Testando funcionalidade de diárias...');

// Simular dados de teste
const diariaTeste = {
  id: 'teste-123',
  colaborador_id: 'colab-123',
  colaborador_nome: 'João Silva',
  colaborador_funcao: 'Operador',
  quantidade: 1,
  valor_unitario: 150.00,
  adicional: 0,
  desconto: 0,
  valor_total: 150.00,
  data_diaria: '2024-01-15',
  data_pagamento: undefined,
  status_pagamento: 'pendente', // ← Este campo deve existir
  observacoes: 'Teste',
  relacao_diaria_id: 'rel-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

console.log('📊 Diária de teste:', diariaTeste);

// Verificar se o botão deve aparecer
const deveMostrarBotao = diariaTeste.status_pagamento === 'pendente';
console.log('✅ Botão "Marcar como Pago" deve aparecer:', deveMostrarBotao);

// Testar diferentes status
const statusTeste = ['pendente', 'pago', 'cancelado', null, undefined];
statusTeste.forEach(status => {
  const mostra = status === 'pendente';
  console.log(`Status: ${status} → Mostra botão: ${mostra}`);
});

console.log('🎯 Para resolver o problema:');
console.log('1. Aplique a migração: db/migrations/add_status_pagamento_diarias.sql');
console.log('2. Recarregue a página');
console.log('3. Verifique se as diárias têm status_pagamento = "pendente"');


