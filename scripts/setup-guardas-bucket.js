#!/usr/bin/env node

/**
 * Script para criar o bucket 'guardas-fotos' no Supabase Storage
 * 
 * Uso:
 *   node scripts/setup-guardas-bucket.js
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  console.error('   Certifique-se que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Configuração do bucket
const BUCKET_CONFIG = {
  name: 'guardas-fotos',
  public: true,
  fileSizeLimit: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
}

async function setupGuardasBucket() {
  console.log('🚀 Configurando bucket de fotos de guardas...\n')
  console.log(`📦 Bucket: ${BUCKET_CONFIG.name}`)
  console.log(`🔒 Público: ${BUCKET_CONFIG.public ? 'Sim' : 'Não'}`)
  console.log(`📏 Tamanho máximo: ${BUCKET_CONFIG.fileSizeLimit / 1024 / 1024}MB`)
  console.log(`📋 Tipos permitidos: ${BUCKET_CONFIG.allowedMimeTypes.join(', ')}\n`)

  try {
    // 1. Verificar se o bucket já existe
    console.log('🔍 Verificando se o bucket já existe...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError.message)
      process.exit(1)
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_CONFIG.name)

    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_CONFIG.name}' já existe!`)
      console.log('\n📝 Próximos passos:')
      console.log('1. Verifique as políticas RLS no Dashboard do Supabase')
      console.log('2. Teste o upload de foto no modal de Nova Diária')
      console.log('3. Confirme que as fotos estão sendo salvas corretamente')
      return
    }

    // 2. Criar o bucket
    console.log(`📦 Criando bucket '${BUCKET_CONFIG.name}'...`)
    const { data, error } = await supabase.storage.createBucket(BUCKET_CONFIG.name, {
      public: BUCKET_CONFIG.public,
      fileSizeLimit: BUCKET_CONFIG.fileSizeLimit,
      allowedMimeTypes: BUCKET_CONFIG.allowedMimeTypes
    })

    if (error) {
      console.error('❌ Erro ao criar bucket:', error.message)
      
      if (error.message.includes('already exists')) {
        console.log('ℹ️  O bucket já existe (erro ignorado)')
      } else {
        process.exit(1)
      }
    } else {
      console.log(`✅ Bucket '${BUCKET_CONFIG.name}' criado com sucesso!`)
    }

    // 3. Instruções para políticas RLS
    console.log('\n🔒 IMPORTANTE: Configure as políticas RLS manualmente')
    console.log('\n📋 No Dashboard do Supabase (Storage → guardas-fotos → Policies):')
    console.log('\n1️⃣  SELECT Policy:')
    console.log('   Nome: Usuários autenticados podem visualizar fotos')
    console.log('   Target: authenticated')
    console.log('   USING: bucket_id = \'guardas-fotos\'')
    console.log('\n2️⃣  INSERT Policy:')
    console.log('   Nome: Usuários autenticados podem fazer upload')
    console.log('   Target: authenticated')
    console.log('   WITH CHECK: bucket_id = \'guardas-fotos\'')
    console.log('\n3️⃣  UPDATE Policy:')
    console.log('   Nome: Usuários autenticados podem atualizar')
    console.log('   Target: authenticated')
    console.log('   USING: bucket_id = \'guardas-fotos\'')
    console.log('\n4️⃣  DELETE Policy:')
    console.log('   Nome: Usuários autenticados podem deletar')
    console.log('   Target: authenticated')
    console.log('   USING: bucket_id = \'guardas-fotos\'')

    console.log('\n✅ Configuração concluída!')
    console.log('\n📝 Próximos passos:')
    console.log('1. Configure as políticas RLS conforme instruções acima')
    console.log('2. Teste o upload de foto no modal de Nova Diária')
    console.log('3. Verifique no Dashboard se as fotos estão sendo salvas')
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    process.exit(1)
  }
}

// Executar configuração
setupGuardasBucket()
  .then(() => {
    console.log('\n🎉 Script finalizado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error)
    process.exit(1)
  })





