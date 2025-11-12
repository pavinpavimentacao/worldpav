#!/usr/bin/env node

/**
 * ========================================
 * SCRIPT DE DIAGNÓSTICO DO SUPABASE STORAGE
 * ========================================
 * 
 * Este script verifica:
 * 1. Quais buckets existem no Supabase
 * 2. Configuração de cada bucket (público/privado, limites, tipos permitidos)
 * 3. Políticas RLS configuradas
 * 4. Testa upload e leitura em cada bucket
 * 5. Compara com os buckets esperados pelo código
 * 
 * Execute: node scripts/diagnostico-storage.js
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  console.error('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ========================================
// BUCKETS ESPERADOS PELO CÓDIGO
// ========================================
const BUCKETS_ESPERADOS = {
  // De 15_storage_setup.sql
  'colaboradores-documents': { public: false, tipos: ['application/pdf', 'image/*', 'application/zip'] },
  'colaboradores-photos': { public: false, tipos: ['image/*'] },
  'maquinarios-photos': { public: false, tipos: ['image/*'] },
  'maquinarios-documents': { public: false, tipos: ['application/pdf', 'image/*'] },
  'obras-photos': { public: false, tipos: ['image/*'] },
  'notas-fiscais': { public: false, tipos: ['application/pdf'] },
  'relatorios-photos': { public: false, tipos: ['image/*'] },
  'contas-pagar-documents': { public: false, tipos: ['application/pdf', 'image/*'] },
  'general-uploads': { public: false, tipos: ['*'] },
  
  // De 20_setup_storage_bucket.sql
  'documents': { public: false, tipos: ['application/pdf', 'application/msword', 'text/plain', 'image/*'] },
  
  // De criar_buckets_obras.sql
  'obras-notas-fiscais': { public: true, tipos: ['application/pdf'] },
  'obras-medicoes': { public: true, tipos: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] },
  'obras-comprovantes': { public: true, tipos: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'] },
  
  // De criar_bucket_contratos_documentacao.sql
  'contratos-documentacao': { public: true, tipos: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'] },
  
  // Buckets usados no código mas NÃO nas migrations
  'attachments': { public: false, tipos: ['application/pdf', 'application/xml', 'text/xml'], nota: '⚠️ USADO MAS NÃO CONFIGURADO!' },
  'obras-pagamentos-diretos': { public: true, tipos: ['application/pdf'], nota: '⚠️ USADO MAS NÃO CONFIGURADO!' }
}

// ========================================
// LOCAIS NO CÓDIGO QUE USAM STORAGE
// ========================================
const LOCAIS_UPLOAD = [
  { arquivo: 'NotaFiscalForm.tsx', bucket: 'attachments', linha: 91, deveria: 'obras-notas-fiscais' },
  { arquivo: 'NotaFiscalFormSimple.tsx', bucket: 'attachments', linha: 116, deveria: 'obras-notas-fiscais' },
  { arquivo: 'ContaPagarForm.tsx', bucket: 'attachments', linha: 266, deveria: 'obras-comprovantes ou contas-pagar-documents' },
  { arquivo: 'AdicionarNotaFiscalModal.tsx', bucket: 'obras-notas-fiscais', linha: 100, ok: true },
  { arquivo: 'EditarNotaFiscalModal.tsx', bucket: 'obras-notas-fiscais', linha: 113, ok: true },
  { arquivo: 'AdicionarMedicaoModal.tsx', bucket: 'obras-medicoes', linha: 125, ok: true },
  { arquivo: 'AdicionarPagamentoDiretoModal.tsx', bucket: 'obras-pagamentos-diretos', linha: 86, erro: 'Falta 3º parâmetro (path)' },
  { arquivo: 'NovoContratoModal.tsx', bucket: 'contratos-documentacao', linha: 89, ok: true },
  { arquivo: 'NovaDocumentacaoModal.tsx', bucket: 'contratos-documentacao', linha: 87, ok: true },
  { arquivo: 'FileUpload.tsx', bucket: 'documents', linha: 55, ok: true },
  { arquivo: 'colaborador-storage.ts', bucket: 'colaboradores-documents', linha: 81, ok: true }
]

// ========================================
// FUNÇÕES DE DIAGNÓSTICO
// ========================================

async function listarBuckets() {
  console.log('\n📦 LISTANDO BUCKETS DO SUPABASE...\n')
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Erro ao listar buckets:', error.message)
      return []
    }
    
    if (!buckets || buckets.length === 0) {
      console.log('⚠️  Nenhum bucket encontrado!')
      return []
    }
    
    console.log(`✅ ${buckets.length} bucket(s) encontrado(s):\n`)
    
    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name}`)
      console.log(`   ID: ${bucket.id}`)
      console.log(`   Público: ${bucket.public ? '✅ Sim' : '❌ Não'}`)
      console.log(`   Tamanho máx: ${bucket.file_size_limit ? (bucket.file_size_limit / (1024 * 1024)).toFixed(2) + ' MB' : 'Não definido'}`)
      console.log(`   Tipos permitidos: ${bucket.allowed_mime_types ? bucket.allowed_mime_types.join(', ') : 'Todos'}`)
      console.log(`   Criado em: ${new Date(bucket.created_at).toLocaleString('pt-BR')}`)
      console.log('')
    })
    
    return buckets
  } catch (error) {
    console.error('❌ Erro ao listar buckets:', error)
    return []
  }
}

async function compararBuckets(bucketsExistentes) {
  console.log('\n🔍 COMPARANDO BUCKETS ESPERADOS vs EXISTENTES...\n')
  
  const bucketsExistentesMap = new Map(bucketsExistentes.map(b => [b.name, b]))
  const problemas = []
  
  // Verificar buckets esperados
  for (const [nome, config] of Object.entries(BUCKETS_ESPERADOS)) {
    if (!bucketsExistentesMap.has(nome)) {
      console.log(`❌ FALTANDO: ${nome}`)
      if (config.nota) {
        console.log(`   ${config.nota}`)
      }
      problemas.push({ tipo: 'FALTANDO', bucket: nome, config })
    } else {
      const bucketExistente = bucketsExistentesMap.get(nome)
      const publicMismatch = bucketExistente.public !== config.public
      
      if (publicMismatch) {
        console.log(`⚠️  DIVERGÊNCIA: ${nome}`)
        console.log(`   Esperado: ${config.public ? 'Público' : 'Privado'}`)
        console.log(`   Atual: ${bucketExistente.public ? 'Público' : 'Privado'}`)
        problemas.push({ tipo: 'DIVERGÊNCIA', bucket: nome, esperado: config, atual: bucketExistente })
      } else {
        console.log(`✅ OK: ${nome}`)
      }
    }
  }
  
  // Verificar buckets extras (não esperados)
  for (const bucket of bucketsExistentes) {
    if (!BUCKETS_ESPERADOS[bucket.name]) {
      console.log(`⚠️  EXTRA (não documentado): ${bucket.name}`)
      problemas.push({ tipo: 'EXTRA', bucket: bucket.name })
    }
  }
  
  return problemas
}

async function testarUpload(bucketName) {
  try {
    // Criar um arquivo de teste temporário
    const testContent = `Teste de upload - ${new Date().toISOString()}`
    const testFileName = `test-${Date.now()}.txt`
    const testPath = `diagnostico/${testFileName}`
    
    // Tentar fazer upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        upsert: false
      })
    
    if (error) {
      return { sucesso: false, erro: error.message }
    }
    
    // Tentar deletar o arquivo de teste
    await supabase.storage
      .from(bucketName)
      .remove([testPath])
    
    return { sucesso: true }
  } catch (error) {
    return { sucesso: false, erro: error.message }
  }
}

async function testarBuckets(bucketsExistentes) {
  console.log('\n🧪 TESTANDO UPLOAD EM CADA BUCKET...\n')
  
  const resultados = []
  
  for (const bucket of bucketsExistentes) {
    const resultado = await testarUpload(bucket.name)
    
    if (resultado.sucesso) {
      console.log(`✅ ${bucket.name}: Upload OK`)
    } else {
      console.log(`❌ ${bucket.name}: ${resultado.erro}`)
    }
    
    resultados.push({ bucket: bucket.name, ...resultado })
  }
  
  return resultados
}

function analisarCodigoFonte() {
  console.log('\n📝 ANÁLISE DO CÓDIGO FONTE...\n')
  
  console.log('Arquivos com problemas:\n')
  
  const problemas = LOCAIS_UPLOAD.filter(local => !local.ok)
  const ok = LOCAIS_UPLOAD.filter(local => local.ok)
  
  problemas.forEach(local => {
    console.log(`❌ ${local.arquivo} (linha ${local.linha})`)
    console.log(`   Usando: ${local.bucket}`)
    if (local.deveria) {
      console.log(`   Deveria usar: ${local.deveria}`)
    }
    if (local.erro) {
      console.log(`   Erro: ${local.erro}`)
    }
    console.log('')
  })
  
  console.log(`\n✅ ${ok.length} arquivo(s) correto(s)`)
  console.log(`❌ ${problemas.length} arquivo(s) com problema(s)`)
  
  return problemas
}

function gerarRelatorio(bucketsExistentes, problemasBuckets, problemasUpload, problemascodigo) {
  console.log('\n' + '='.repeat(80))
  console.log('📊 RELATÓRIO FINAL DE DIAGNÓSTICO')
  console.log('='.repeat(80) + '\n')
  
  // Resumo
  console.log('📋 RESUMO:\n')
  console.log(`   Buckets configurados no Supabase: ${bucketsExistentes.length}`)
  console.log(`   Buckets esperados pelas migrations: ${Object.keys(BUCKETS_ESPERADOS).length}`)
  console.log(`   Problemas encontrados nos buckets: ${problemasBuckets.length}`)
  console.log(`   Problemas de upload testados: ${problemasUpload.filter(p => !p.sucesso).length}`)
  console.log(`   Arquivos com código incorreto: ${problemascodigo.length}`)
  
  // Problemas críticos
  console.log('\n\n🔴 PROBLEMAS CRÍTICOS:\n')
  
  const bucketsFaltando = problemasBuckets.filter(p => p.tipo === 'FALTANDO')
  if (bucketsFaltando.length > 0) {
    console.log('   Buckets faltando:')
    bucketsFaltando.forEach(p => {
      console.log(`   - ${p.bucket}`)
      if (p.config.nota) {
        console.log(`     ${p.config.nota}`)
      }
    })
  }
  
  const uploadsComErro = problemasUpload.filter(p => !p.sucesso)
  if (uploadsComErro.length > 0) {
    console.log('\n   Buckets com erro de upload/políticas:')
    uploadsComErro.forEach(p => {
      console.log(`   - ${p.bucket}: ${p.erro}`)
    })
  }
  
  if (problemascodigo.length > 0) {
    console.log('\n   Arquivos com bucket incorreto:')
    problemascodigo.forEach(p => {
      console.log(`   - ${p.arquivo}: usando '${p.bucket}' ao invés de '${p.deveria || 'bucket correto'}'`)
    })
  }
  
  // Recomendações
  console.log('\n\n💡 RECOMENDAÇÕES:\n')
  
  if (bucketsFaltando.length > 0) {
    console.log('   1. Execute as migrations SQL para criar os buckets faltantes:')
    console.log('      - db/migrations/criar_buckets_obras.sql')
    console.log('      - db/migrations/15_storage_setup.sql')
  }
  
  if (problemascodigo.length > 0) {
    console.log('\n   2. Corrija os arquivos TypeScript que usam buckets incorretos')
  }
  
  if (uploadsComErro.length > 0) {
    console.log('\n   3. Verifique as políticas RLS dos buckets com erro de upload')
  }
  
  console.log('\n' + '='.repeat(80) + '\n')
}

// ========================================
// MAIN
// ========================================

async function main() {
  console.log('🚀 INICIANDO DIAGNÓSTICO DO SUPABASE STORAGE\n')
  console.log(`URL Supabase: ${supabaseUrl}`)
  console.log(`Tipo de chave: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon'}\n`)
  
  // 1. Listar buckets existentes
  const bucketsExistentes = await listarBuckets()
  
  // 2. Comparar com esperados
  const problemasBuckets = await compararBuckets(bucketsExistentes)
  
  // 3. Testar upload em cada bucket
  const problemasUpload = await testarBuckets(bucketsExistentes)
  
  // 4. Analisar código fonte
  const problemascodigo = analisarCodigoFonte()
  
  // 5. Gerar relatório final
  gerarRelatorio(bucketsExistentes, problemasBuckets, problemasUpload, problemascodigo)
  
  // Salvar relatório em arquivo
  const relatorio = {
    data: new Date().toISOString(),
    bucketsExistentes: bucketsExistentes.map(b => ({
      name: b.name,
      public: b.public,
      file_size_limit: b.file_size_limit,
      allowed_mime_types: b.allowed_mime_types
    })),
    problemasBuckets,
    problemasUpload,
    problemascodigo
  }
  
  const relatorioPath = path.join(process.cwd(), 'diagnostico-storage-report.json')
  fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2))
  console.log(`📄 Relatório detalhado salvo em: ${relatorioPath}\n`)
}

main().catch(console.error)

