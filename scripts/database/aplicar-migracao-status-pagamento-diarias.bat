@echo off
echo ============================================
echo APLICAR MIGRACAO - STATUS_PAGAMENTO_DIARIAS
echo ============================================
echo.
echo Este script aplica a migração que adiciona os campos
echo status_pagamento e data_pagamento na tabela controle_diario_diarias
echo.
pause

echo Aplicando migração...
echo.

cd /d "%~dp0.."

REM Verificar se o Supabase CLI está instalado
where supabase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Supabase CLI nao esta instalado ou nao esta no PATH
    echo.
    echo Para aplicar a migracao manualmente:
    echo 1. Acesse o Supabase Dashboard
    echo 2. Va para SQL Editor
    echo 3. Execute o arquivo: db\migrations\add_status_pagamento_diarias.sql
    echo.
    pause
    exit /b 1
)

echo Aplicando migração via Supabase CLI...
supabase db push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo MIGRACAO APLICADA COM SUCESSO!
    echo ============================================
    echo.
    echo Os campos foram adicionados:
    echo - status_pagamento (TEXT DEFAULT 'pendente')
    echo - data_pagamento (DATE)
    echo - data_diaria (DATE)
    echo - updated_at (TIMESTAMPTZ)
    echo.
) else (
    echo.
    echo ERRO ao aplicar migracao!
    echo.
    echo Para aplicar manualmente:
    echo 1. Acesse o Supabase Dashboard
    echo 2. Va para SQL Editor  
    echo 3. Execute o arquivo: db\migrations\add_status_pagamento_diarias.sql
    echo.
)

pause


