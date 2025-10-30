/**
 * Testar busca de equipes corrigida
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

async function testar() {
  console.log('🔍 TESTANDO BUSCA DE EQUIPES CORRIGIDA\n')
  
  try {
    // Buscar colaboradores agrupados por tipo de equipe
    console.log('Buscando colaboradores...')
    const { data, error } = await supabase
      .from('colaboradores')
      .select('id, name, tipo_equipe')
      .not('tipo_equipe', 'is', null)
      .eq('status', 'ativo')
      .is('deleted_at', null)

    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }
    
    console.log(`✅ Colaboradores encontrados: ${data?.length || 0}\n`)
    
    if (data && data.length > 0) {
      data.forEach((colab, i) => {
        console.log(`${i + 1}. ${colab.name} - Tipo: ${colab.tipo_equipe}`)
      })
      
      // Agrupar por tipo
      const tipos = new Set(data.map(c => c.tipo_equipe))
      console.log(`\n✅ Tipos de equipe encontrados: ${tipos.size}`)
      tipos.forEach(tipo => {
        const count = data.filter(c => c.tipo_equipe === tipo).length
        console.log(`  - ${tipo}: ${count} colaborador(es)`)
      })
      
      // Simular criação de equipes
      console.log('\nEquipes que seriam criadas:')
      const equipesMap = new Map()
      
      data.forEach((colab) => {
        const tipo = colab.tipo_equipe || 'outros'
        const chave = tipo
        
        if (!equipesMap.has(chave)) {
          const nomeEquipe = tipo === 'pavimentacao' ? 'Equipe de Pavimentação' :
                           tipo === 'maquinas' ? 'Equipe de Máquinas' :
                           tipo === 'apoio' ? 'Equipe de Apoio' : 'Outros'
          
          equipesMap.set(chave, {
            id: chave,
            name: nomeEquipe,
            prefixo: tipo.substring(0, 3).toUpperCase(),
            tipo_equipe: tipo
          })
        }
      })
      
      const equipes = Array.from(equipesMap.values())
      equipes.forEach(eq => {
        console.log(`  - ${eq.name} (${eq.prefixo})`)
      })
    } else {
      console.log('⚠️ Nenhum colaborador encontrado com tipo_equipe definido')
    }
    
    console.log('\n✅ Teste concluído!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testar()

