import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AuthProvider } from './lib/auth'
import { ToastProvider } from './lib/toast'
import { initializeTimezone } from './config/timezone'
import { setupSaoPauloTimezone } from './config/timezone-setup'
import './styles/globals.css'
import './styles/print.css'

// Inicializar configurações do sistema
initializeTimezone()
setupSaoPauloTimezone()

// Diagnóstico de variáveis de ambiente
console.log('=== DIAGNÓSTICO DE VARIÁVEIS DE AMBIENTE ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('VITE_OWNER_COMPANY_NAME:', import.meta.env.VITE_OWNER_COMPANY_NAME);
console.log('VITE_SECOND_COMPANY_NAME:', import.meta.env.VITE_SECOND_COMPANY_NAME);
console.log('VITE_TIMEZONE:', import.meta.env.VITE_TIMEZONE);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);
console.log('==========================================');

console.log('Iniciando renderização do React...')

try {
  const rootElement = document.getElementById('root')
  console.log('Elemento root encontrado:', !!rootElement)
  
  if (!rootElement) {
    throw new Error('Elemento root não encontrado!')
  }

  const root = ReactDOM.createRoot(rootElement)
  console.log('Root do React criado com sucesso')

  root.render(
    <React.StrictMode>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </React.StrictMode>,
  )
  
  console.log('React renderizado com sucesso!')
} catch (error) {
  console.error('Erro ao renderizar React:', error)
}







