/**
 * Identificar e deletar ruas de teste/mockup
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

async function limpar() {
  console.log('🧹 IDENTIFICANDO RUAS DE TESTE\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // Buscar todas as ruas
    const { data: todasRuas } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: true })
    
    console.log(`Total de ruas encontradas: ${todasRuas?.length || 0}\n`)
    
    if (todasRuas) {
      console.log('Lista de ruas:')
      console.log('-'.repeat(70))
      
      for (const rua of todasRuas) {
        console.log(`\nRua: ${rua.name}`)
        console.log(`  ID: ${rua.id}`)
        console.log(`  Status: ${rua.status}`)
        console.log(`  Deleted: ${rua.deleted_at ? 'SIM' : 'NÃO'}`)
        console.log(`  Criada em: ${rua.created_at}`)
        console.log(`  Metragem executada: ${rua.metragem_executada || 'N/A'}`)
      }
      
      // Identificar ruas de teste (nome "teste" ou padrão repetido)
      const nomesTeste = ['teste', 'Rua Teste', 'Rua Teste Nova', 'Rua Teste Completa']
      const ruasParaDeletar = todasRuas.filter(r => 
        nomesTeste.some(nomeTeste => r.name.toLowerCase().includes(nomeTeste.toLowerCase()))
      )
      
      console.log('\n' + '='.repeat(70))
      console.log(`Ruas identificadas como de teste: ${ruasParaDeletar.length}\n`)
      
      if (ruasParaDeletar.length > 0) {
        console.log('Ruas de teste que serão deletadas:')
        ruasParaDeletar.forEach(rua => {
          console.log(`  - ${rua.name} (ID: ${rua.id}, Status: ${rua.status})`)
        })
        
        console.log('\n⚠️ ATENÇÃO: Estas ruas serão DELETADAS permanentemente!')
        console.log('Execute este script com cuidado e confirme se deseja deletar.\n')
        
        // Deletar ruas de teste
        for (const rua of ruasParaDeletar) {
          const { error } = await supabase
            .from('obras_ruas')
            .delete()
            .eq('id', rua.id)
          
          if (error) {
            console.error(`❌ Erro ao deletar ${rua.name}:`, error)
          } else {
            console.log(`✅ Deletada: ${rua.name}`)
          }
        }
      } else {
        console.log('Nenhuma rua de teste identificada.')
      }
    }
    
    // Verificar o que sobrou
    console.log('\n' + '='.repeat(70))
    console.log('VERIFICANDO RUAS RESTANTES...\n')
    
    const { data: ruasRestantes } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    console.log(`Ruas restantes na obra: ${ruasRestantes?.length || 0}\n`)
    
    if (ruasRestantes && ruasRestantes.length > 0) {
      ruasRestantes.forEach((rua, i) => {
        console.log(`${i + 1}. ${rua.name}`)
        console.log(`   Status: ${rua.status}`)
        console.log(`   Metragem planejada: ${rua.metragem_planejada || 'N/A'} m²`)
        console.log(`   Metragem executada: ${rua.metragem_executada || 'N/A'} m²`)
      })
    } else {
      console.log('⚠️ Nenhuma rua real cadastrada na obra.')
    }
    
    console.log('\n✅ Limpeza concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

limpar()









