@echo off
echo.
echo ========================================
echo   Corrigir Tabelas de Financeiro
echo ========================================
echo.
echo Este script ira abrir o arquivo SQL SIMPLIFICADO
echo que evita erros de "already exists".
echo.
echo PASSOS:
echo 1. Acesse https://supabase.com/dashboard
echo 2. Va em SQL Editor (menu lateral)
echo 3. Clique em New Query
echo 4. Copie e cole TODO o conteudo do arquivo que sera aberto
echo 5. Execute o SQL (botao Run ou Ctrl+Enter)
echo.
echo IMPORTANTE: Use este arquivo simplificado se o outro
echo             deu erro de "relation already exists"
echo.
pause

notepad db\migrations\create_obras_financeiro_MINIMO.sql

echo.
echo ========================================
echo Arquivo aberto! Siga os passos acima.
echo ========================================
echo.
echo Depois de executar, teste:
echo 1. Abra uma obra no sistema
echo 2. Clique na aba Financeiro
echo 3. Nao deve mais dar erro 404!
echo.
pause

