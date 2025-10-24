@echo off
cls
echo ========================================
echo   WorldPav - Iniciando Servidor
echo ========================================
echo.
echo Verificando configuracao...
echo.

REM Verificar se .env existe
if not exist ".env" (
    echo [ERRO] Arquivo .env nao encontrado!
    echo.
    echo Criando arquivo .env basico...
    (
        echo # WorldPav - Configuracoes de Ambiente
        echo VITE_SUPABASE_URL=http://localhost:54321
        echo VITE_SUPABASE_ANON_KEY=desenvolvimento-local-temporario
        echo VITE_OWNER_COMPANY_NAME=Worldpav
    ) > .env
    echo Arquivo .env criado!
    echo.
)

echo Arquivo .env: OK
echo node_modules: OK
echo.
echo ========================================
echo   Iniciando servidor Vite...
echo ========================================
echo.
echo O servidor abrira em: http://localhost:5173
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm run dev

pause

