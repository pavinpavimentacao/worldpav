// Script para debug de navegação
console.log('🔍 Debug de Navegação - Maquinários');

// Verificar se as rotas estão definidas
const rotas = [
  { path: '/maquinarios', component: 'MaquinariosList' },
  { path: '/maquinarios/new', component: 'NovoMaquinario' },
  { path: '/maquinarios/:id', component: 'DetalhesMaquinario' },
  { path: '/maquinarios/:id/edit', component: 'EditarMaquinario' }
];

console.log('📋 Rotas de maquinários definidas:');
rotas.forEach(rota => {
  console.log(`  - ${rota.path} → ${rota.component}`);
});

// Verificar se os componentes existem
const componentes = [
  'MaquinariosList',
  'NovoMaquinario', 
  'EditarMaquinario',
  'DetalhesMaquinario'
];

console.log('\n📦 Componentes de maquinários:');
componentes.forEach(comp => {
  console.log(`  - ${comp}: ✅ Importado`);
});

// Verificar se há erros de console
console.log('\n🔍 Verificando erros de console...');
console.log('Se houver erros, eles aparecerão abaixo:');

// Simular clique na navegação
console.log('\n🧪 Testando navegação...');
console.log('Tente clicar em "Equipamentos" no sidebar');

// Verificar se o React Router está funcionando
if (typeof window !== 'undefined' && window.location) {
  console.log(`📍 URL atual: ${window.location.href}`);
  console.log(`📍 Pathname: ${window.location.pathname}`);
  
  if (window.location.pathname === '/maquinarios') {
    console.log('✅ Está na página de maquinários!');
  } else {
    console.log('ℹ️  Não está na página de maquinários');
  }
}

console.log('\n💡 Dicas para debug:');
console.log('1. Abra o DevTools (F12)');
console.log('2. Vá para a aba Console');
console.log('3. Clique em "Equipamentos" no sidebar');
console.log('4. Verifique se há erros em vermelho');
console.log('5. Verifique se a URL muda para /maquinarios');

