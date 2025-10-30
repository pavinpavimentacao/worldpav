/**
 * EXECUTOR: Todos os Testes de Migração
 * 
 * Executa todos os testes de migração em sequência
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  test: (msg) => console.log(`🧪 ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`)
};

async function runTestScript(scriptPath) {
  try {
    log.test(`Executando: ${scriptPath}`);
    
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`, {
      cwd: join(__dirname, '../../'),
      maxBuffer: 1024 * 1024 * 10 // 10MB
    });
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error(stderr);
    }
    
    return { success: true, output: stdout };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr 
    };
  }
}

async function main() {
  log.section('INICIANDO TODOS OS TESTES DE MIGRAÇÃO');
  
  const testFiles = [
    join(__dirname, 'test-relatorios-diarios.js'),
    join(__dirname, 'test-controle-diario-diarias.js')
  ];
  
  const resultados = [];
  
  for (const file of testFiles) {
    log.info(`\n📄 Executando: ${file.split('/').pop()}`);
    
    const resultado = await runTestScript(file);
    resultados.push({ file, ...resultado });
    
    if (resultado.success) {
      log.success(`Teste concluído: ${file.split('/').pop()}`);
    } else {
      log.error(`Teste falhou: ${file.split('/').pop()}`);
    }
  }
  
  // Resumo final
  log.section('RESUMO FINAL');
  
  const sucessos = resultados.filter(r => r.success).length;
  const falhas = resultados.filter(r => !r.success).length;
  
  resultados.forEach(r => {
    const nome = r.file.split('/').pop();
    if (r.success) {
      log.success(`${nome}: PASSOU`);
    } else {
      log.error(`${nome}: FALHOU`);
      if (r.error) {
        log.error(`   Erro: ${r.error}`);
      }
    }
  });
  
  log.info(`\nTotal de Testes: ${resultados.length}`);
  log.success(`Passou: ${sucessos}`);
  log.error(`Falhou: ${falhas}`);
  
  if (falhas === 0) {
    log.section('✅ TODOS OS TESTES PASSARAM!');
    process.exit(0);
  } else {
    log.section(`❌ ${falhas} teste(s) falharam`);
    process.exit(1);
  }
}

main().catch(error => {
  log.error(`Erro fatal: ${error.message}`);
  process.exit(1);
});


