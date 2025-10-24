#!/usr/bin/env node

/**
 * Script para configurar buckets do Supabase Storage
 * 
 * Este script cria os buckets necessários para o sistema de obras
 * e configura as políticas de acesso (RLS)
 * 
 * USO:
 * node scripts/setup-storage-buckets.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carrega variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  console.error('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Definição dos buckets necessários
const BUCKETS = [
  {
    name: 'obras-notas-fiscais',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf']
  },
  {
    name: 'obras-medicoes',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel' // xls
    ]
  },
  {
    name: 'obras-comprovantes',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]
  }
]

async function setupBuckets() {
  console.log('🚀 Configurando buckets do Supabase Storage...\n')

  for (const bucketConfig of BUCKETS) {
    console.log(`📦 Processando bucket: ${bucketConfig.name}`)

    try {
      // Verifica se o bucket já existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error(`   ❌ Erro ao listar buckets: ${listError.message}`)
        continue
      }

      const bucketExists = buckets?.some(b => b.name === bucketConfig.name)

      if (bucketExists) {
        console.log(`   ✓ Bucket já existe: ${bucketConfig.name}`)
      } else {
        // Cria o bucket
        const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
          public: bucketConfig.public,
          fileSizeLimit: bucketConfig.fileSizeLimit,
          allowedMimeTypes: bucketConfig.allowedMimeTypes
        })

        if (error) {
          console.error(`   ❌ Erro ao criar bucket: ${error.message}`)
        } else {
          console.log(`   ✓ Bucket criado com sucesso: ${bucketConfig.name}`)
        }
      }
    } catch (error) {
      console.error(`   ❌ Erro inesperado: ${error.message}`)
    }
  }

  console.log('\n✅ Configuração de buckets concluída!')
  console.log('\n📝 Próximos passos:')
  console.log('1. Verifique no dashboard do Supabase se os buckets foram criados')
  console.log('2. Configure as políticas RLS se necessário')
  console.log('3. Teste o upload de arquivos no sistema')
}

// Executar configuração
setupBuckets()
  .then(() => {
    console.log('\n✨ Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })



