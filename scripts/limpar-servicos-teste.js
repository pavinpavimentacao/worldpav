/**
 * Verificar e ajustar serviços de teste
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
  console.log('🔍 VERIFICANDO SERVIÇOS DA OBRA\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
    
    console.log(`Total de serviços: ${servicos?.length || 0}\n`)
    
    if (servicos && servicos.length > 0) {
      console.log('Serviços cadastrados:')
      console.log('-'.repeat(70))
      
      servicos.forEach((serv, i) => {
        console.log(`\n${i + 1}. ${serv.servico_nome || serv.name}`)
        console.log(`   ID: ${serv.id}`)
        console.log(`   Unidade: ${serv.unidade}`)
        console.log(`   Quantidade: ${serv.quantidade}`)
        console.log(`   Preço unitário: R$ ${parseFloat(serv.preco_unitario).toFixed(2)}`)
        console.log(`   Valor total: R$ ${parseFloat(serv.valor_total).toFixed(2)}`)
      })
      
      // Verificar se as quantidades estão incorretas (5700 é suspeito, parece data)
      const servicosIncorretos = servicos.filter(s => s.quantidade === 5700)
      
      if (servicosIncorretos.length > 0) {
        console.log('\n⚠️ ATENÇÃO: Serviços com quantidade de 5700 detectados (parece incorreto)')
        console.log('Estes valores devem ser ajustados com as quantidades reais da obra.\n')
      }
    } else {
      console.log('⚠️ Nenhum serviço cadastrado na obra.')
    }
    
    console.log('\n✅ Verificação concluída!')
    console.log('\n💡 PRÓXIMOS PASSOS:')
    console.log('1. Cadastre as ruas reais da obra na aba "Ruas"')
    console.log('2. Ajuste os serviços com as quantidades corretas')
    console.log('3. Finalize as ruas conforme a execução da obra')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificar()







