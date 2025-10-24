@echo off
cls
echo ========================================
echo   WORLDPAV - Teste de Ambiente
echo ========================================
echo.

echo [1/4] Testando Node.js...
where node >nul 2>&1
if %errorlevel% == 0 (
    node --version
    echo    ✓ Node.js encontrado!
) else (
    echo    ✗ Node.js NAO encontrado!
    echo    Solucao: Instale Node.js 18.20.4
    echo    Download: https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi
)
echo.

echo [2/4] Testando NPM...
where npm >nul 2>&1
if %errorlevel% == 0 (
    npm --version
    echo    ✓ NPM encontrado!
) else (
    echo    ✗ NPM NAO encontrado!
)
echo.

echo [3/4] Verificando node_modules...
if exist "node_modules" (
    echo    ✓ Dependencias ja instaladas!
) else (
    echo    ✗ Dependencias NAO instaladas
    echo    Execute: npm install
)
echo.

echo [4/4] Verificando .env...
if exist ".env" (
    echo    ✓ Arquivo .env configurado!
) else (
    echo    ✗ Arquivo .env NAO existe
    echo    Copie .env.example para .env e configure
)
echo.

echo ========================================
echo   Resultado do Diagnostico
echo ========================================
echo.

where node >nul 2>&1
if %errorlevel% == 0 (
    if exist "node_modules" (
        if exist ".env" (
            echo STATUS: ✓ PRONTO PARA RODAR!
            echo.
            echo Execute: npm run dev
        ) else (
            echo STATUS: Configure o arquivo .env
        )
    ) else (
        echo STATUS: Execute npm install
    )
) else (
    echo STATUS: Instale Node.js primeiro
    echo.
    echo Link de download:
    echo https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi
)

echo.
echo ========================================
pause






