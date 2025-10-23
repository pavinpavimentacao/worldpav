const fs = require('fs');
const path = require('path');

// Ler o arquivo de mocks
const mockFile = path.join(__dirname, '../src/mocks/colaboradores-mock.ts');
let content = fs.readFileSync(mockFile, 'utf8');

// Adicionar status: 'ativo' após tipo_contrato em todos os colaboradores
content = content.replace(
  /(tipo_contrato: '[^']+',)(\s+salario_fixo:)/g,
  '$1\n    status: \'ativo\',$2'
);

// Escrever o arquivo atualizado
fs.writeFileSync(mockFile, content, 'utf8');

console.log('✅ Status adicionado a todos os colaboradores mockados');
