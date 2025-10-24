@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo    🎭 INSTALAÇÃO DO PLAYWRIGHT MCP - WorldPav
echo ═══════════════════════════════════════════════════════════
echo.

:: Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js 18+ primeiro:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.

:: Verificar se está na pasta correta
if not exist "package.json" (
    echo ❌ ERRO: Não encontrei o arquivo package.json
    echo.
    echo Execute este script na pasta raiz do projeto:
    echo c:\Users\PC\worldpav\
    echo.
    pause
    exit /b 1
)

echo ✅ Pasta do projeto encontrada
echo.

echo ═══════════════════════════════════════════════════════════
echo    📦 Instalando Playwright...
echo ═══════════════════════════════════════════════════════════
echo.

call npm install -D @playwright/test
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar Playwright
    pause
    exit /b 1
)

echo.
echo ✅ Playwright instalado!
echo.

echo ═══════════════════════════════════════════════════════════
echo    🌐 Baixando navegadores...
echo ═══════════════════════════════════════════════════════════
echo.
echo ⚠️  Isso pode levar 2-3 minutos...
echo.

call npx playwright install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar navegadores
    pause
    exit /b 1
)

echo.
echo ✅ Navegadores instalados!
echo.

:: Verificar versão instalada
echo ═══════════════════════════════════════════════════════════
echo    ✅ Verificando instalação...
echo ═══════════════════════════════════════════════════════════
echo.

call npx playwright --version

echo.
echo ═══════════════════════════════════════════════════════════
echo    🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ═══════════════════════════════════════════════════════════
echo.
echo Próximos passos:
echo.
echo 1. Reinicie o Cursor/VS Code completamente
echo 2. Inicie o servidor: npm run dev
echo 3. Pergunte à IA no Cursor:
echo    "Use o Playwright MCP para tirar um screenshot da página inicial"
echo.
echo 📚 Para mais informações, leia:
echo    Docs\CONFIGURACAO_PLAYWRIGHT_MCP.md
echo.

pause



