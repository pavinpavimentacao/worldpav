@echo off
echo.
echo ========================================
echo   Corrigir Tabelas de Notas e Ruas
echo ========================================
echo.
echo Este script ira abrir o arquivo SQL que
echo corrige as colunas faltantes nas tabelas
echo de notas fiscais e ruas.
echo.
echo PASSOS:
echo 1. Acesse https://supabase.com/dashboard
echo 2. Va em SQL Editor (menu lateral)
echo 3. Clique em New Query
echo 4. Copie e cole TODO o conteudo do arquivo que sera aberto
echo 5. Execute o SQL (botao Run ou Ctrl+Enter)
echo.
echo IMPORTANTE: Este script adiciona colunas que estao faltando
echo             nas tabelas obras_notas_fiscais e obras_ruas
echo.
pause

notepad db\migrations\corrigir_tabelas_notas_ruas_SIMPLES.sql

echo.
echo ========================================
echo Arquivo aberto! Siga os passos acima.
echo ========================================
echo.
echo Depois de executar, teste:
echo 1. Abra uma obra no sistema
echo 2. Clique na aba "Notas e Medicoes"
echo 3. Nao deve mais dar erro de colunas!
echo.
pause