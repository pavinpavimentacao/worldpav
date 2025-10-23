@echo off
echo ===================================
echo WorldPav - Setup e Inicializacao
echo ===================================
echo.

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js 18.20.4
    pause
    exit /b 1
)

echo.
echo Verificando NPM...
npm --version
if errorlevel 1 (
    echo [ERRO] NPM nao encontrado!
    pause
    exit /b 1
)

echo.
echo Verificando node_modules...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
) else (
    echo Dependencias ja instaladas!
)

echo.
echo Verificando arquivo .env...
if not exist ".env" (
    echo Criando arquivo .env...
    echo # WorldPav - Configuracoes > .env
    echo VITE_SUPABASE_URL=your_supabase_url >> .env
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key >> .env
    echo.
    echo [AVISO] Configure as credenciais do Supabase no arquivo .env!
)

echo.
echo ===================================
echo Iniciando servidor de desenvolvimento...
echo ===================================
npm run dev




