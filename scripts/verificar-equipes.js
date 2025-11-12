/**
 * Verificar equipes cadastradas
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
  console.log('🔍 VERIFICANDO EQUIPES\n')
  
  try {
    // 1. Tentar buscar com tipo_equipe
    console.log('Testando busca com tipo_equipe...')
    const { data: comTipo, error: errorComTipo } = await supabase
      .from('equipes')
      .select('id, name, prefixo, tipo_equipe')
      .limit(5)
    
    if (errorComTipo) {
      console.error('❌ Erro com tipo_equipe:', errorComTipo.message)
      console.log('\nTestando busca SEM tipo_equipe...')
    } else {
      console.log(`✅ Busca com tipo_equipe OK - Equipes encontradas: ${comTipo?.length || 0}`)
      if (comTipo && comTipo.length > 0) {
        console.log('\nEquipes:')
        comTipo.forEach(e => {
          console.log(`  - ${e.name} (${e.prefixo}) - Tipo: ${e.tipo_equipe || 'N/A'}`)
        })
      }
      return
    }
    
    // 2. Buscar sem tipo_equipe se a primeira falhou
    const { data, error } = await supabase
      .from('equipes')
      .select('id, name, prefixo')
      .limit(10)
    
    if (error) {
      console.error('❌ Erro:', error.message)
      console.log('\nVerificando se a tabela existe...')
      
      // Verificar estrutura da tabela
      const { data: tabela, error: errorTabela } = await supabase
        .from('equipes')
        .select('*')
        .limit(1)
      
      if (errorTabela) {
        console.error('❌ Tabela equipes não existe ou erro:', errorTabela.message)
      } else {
        console.log('✅ Tabela existe. Verificando colunas...')
        if (tabela && tabela.length > 0) {
          console.log('Colunas disponíveis:', Object.keys(tabela[0]))
        }
      }
    } else {
      console.log(`✅ Busca OK - Total: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log('\nEquipes encontradas:')
        data.forEach(e => {
          console.log(`  - ${e.name} (${e.prefixo})`)
        })
      } else {
        console.log('⚠️ Nenhuma equipe cadastrada')
      }
    }
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificar()







