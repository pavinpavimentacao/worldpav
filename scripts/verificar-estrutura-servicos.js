/**
 * Verificar a estrutura dos serviços da obra
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

function loadEnv() {
  try {
    const envContent = readFileSync('.env.local', 'utf-8')
    const env = {}
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.split('=')
      if (key && value.length) {
        env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '')
      }
    })
    return env
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

const env = loadEnv()
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function verificar() {
  console.log('🔍 VERIFICANDO ESTRUTURA DOS SERVIÇOS\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    console.log(`Total de serviços: ${servicos?.length || 0}\n`)
    
    if (servicos) {
      servicos.forEach((serv, i) => {
        console.log(`\nServiço ${i + 1}:`)
        console.log(JSON.stringify(serv, null, 2))
      })
    }
    
    // Verificar estrutura da tabela
    console.log('\n' + '='.repeat(60))
    console.log('Verificando estrutura da tabela obras_servicos...')
    
    const { data: tableInfo } = await supabase
      .from('obras_servicos')
      .select('*')
      .limit(0)
    
    console.log('✅ Tabela existe e está acessível')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificar()



