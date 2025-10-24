#!/usr/bin/env python3
"""
Script definitivo para corrigir TODOS os imports do projeto WorldPav
"""
import os
import re

base_dir = "/Users/viniciusambrozio/Downloads/MARKETING DIGITAL/PROGRAMAS/GESTÃO ASFALTO/Worldpav/src"

# MAPEAMENTO COMPLETO DE TODOS OS COMPONENTES REORGANIZADOS
replacements = [
    # ==================== LAYOUT ====================
    (r'from ["\']\.\.\/components\/Layout["\']', 'from "../components/layout/Layout"'),
    (r'from ["\']\.\.\/\.\.\/components\/Layout["\']', 'from "../../components/layout/Layout"'),
    (r'from ["\']\.\.\/components\/RequireAuth["\']', 'from "../components/layout/RequireAuth"'),
    (r'from ["\']\.\.\/\.\.\/components\/RequireAuth["\']', 'from "../../components/layout/RequireAuth"'),
    
    # ==================== SHARED ====================
    (r'from ["\']\.\.\/Button["\']', 'from "../shared/Button"'),
    (r'from ["\']\.\.\/\.\.\/components\/Button["\']', 'from "../../components/shared/Button"'),
    (r'from ["\']\.\.\/components\/Button["\']', 'from "../components/shared/Button"'),
    
    (r'from ["\']\.\.\/Select["\']', 'from "../shared/Select"'),
    (r'from ["\']\.\.\/\.\.\/components\/Select["\']', 'from "../../components/shared/Select"'),
    (r'from ["\']\.\.\/components\/Select["\']', 'from "../components/shared/Select"'),
    
    (r'from ["\']\.\.\/Loading["\']', 'from "../shared/Loading"'),
    (r'from ["\']\.\.\/\.\.\/components\/Loading["\']', 'from "../../components/shared/Loading"'),
    (r'from ["\']\.\.\/components\/Loading["\']', 'from "../components/shared/Loading"'),
    
    (r'from ["\']\.\.\/Badge["\']', 'from "../shared/Badge"'),
    (r'from ["\']\.\.\/\.\.\/components\/Badge["\']', 'from "../../components/shared/Badge"'),
    
    (r'from ["\']\.\.\/Table["\']', 'from "../shared/Table"'),
    (r'from ["\']\.\.\/\.\.\/components\/Table["\']', 'from "../../components/shared/Table"'),
    (r'from ["\']\.\.\/components\/Table["\']', 'from "../components/shared/Table"'),
    
    (r'from ["\']\.\.\/\.\.\/components\/ServicoSelector["\']', 'from "../../components/shared/ServicoSelector"'),
    (r'from ["\']\.\.\/components\/ServicoSelector["\']', 'from "../components/shared/ServicoSelector"'),
    
    (r'from ["\']\.\.\/\.\.\/components\/CompanySelector["\']', 'from "../../components/shared/CompanySelector"'),
    (r'from ["\']\.\.\/components\/CompanySelector["\']', 'from "../components/shared/CompanySelector"'),
    
    (r'from ["\']\.\.\/\.\.\/components\/UFSelector["\']', 'from "../../components/shared/UFSelector"'),
    (r'from ["\']\.\.\/\.\.\/components\/MultiSelect["\']', 'from "../../components/shared/MultiSelect"'),
    (r'from ["\']\.\.\/\.\.\/components\/FloatingSelect["\']', 'from "../../components/shared/FloatingSelect"'),
    (r'from ["\']\.\.\/\.\.\/components\/FormField["\']', 'from "../../components/shared/FormField"'),
    (r'from ["\']\.\.\/\.\.\/components\/TextAreaWithCounter["\']', 'from "../../components/shared/TextAreaWithCounter"'),
    (r'from ["\']\.\.\/\.\.\/components\/PhotoUpload["\']', 'from "../../components/shared/PhotoUpload"'),
    (r'from ["\']\.\.\/\.\.\/components\/NotePreview["\']', 'from "../../components/shared/NotePreview"'),
    
    # ==================== CARDS ====================
    (r'from ["\']\.\.\/DashboardCard["\']', 'from "../cards/DashboardCard"'),
    (r'from ["\']\.\.\/\.\.\/components\/DashboardCard["\']', 'from "../../components/cards/DashboardCard"'),
    (r'from ["\']\.\.\/components\/DashboardCard["\']', 'from "../components/cards/DashboardCard"'),
    
    (r'from ["\']\.\.\/KpiCard["\']', 'from "../cards/KpiCard"'),
    (r'from ["\']\.\.\/\.\.\/components\/KpiCard["\']', 'from "../../components/cards/KpiCard"'),
    (r'from ["\']\.\.\/components\/KpiCard["\']', 'from "../components/cards/KpiCard"'),
    
    (r'from ["\']\.\.\/ObraCard["\']', 'from "../cards/ObraCard"'),
    (r'from ["\']\.\.\/\.\.\/components\/ObraCard["\']', 'from "../../components/cards/ObraCard"'),
    (r'from ["\']\.\.\/components\/ObraCard["\']', 'from "../components/cards/ObraCard"'),
    
    (r'from ["\']\.\.\/StatusCard["\']', 'from "../cards/StatusCard"'),
    (r'from ["\']\.\.\/\.\.\/components\/StatusCard["\']', 'from "../../components/cards/StatusCard"'),
    (r'from ["\']\.\.\/components\/StatusCard["\']', 'from "../components/cards/StatusCard"'),
    
    (r'from ["\']\.\.\/RuaCard["\']', 'from "../cards/RuaCard"'),
    (r'from ["\']\.\.\/\.\.\/components\/RuaCard["\']', 'from "../../components/cards/RuaCard"'),
    (r'from ["\']\.\.\/components\/RuaCard["\']', 'from "../components/cards/RuaCard"'),
    
    (r'from ["\']\.\.\/NextBombaCard["\']', 'from "../cards/NextBombaCard"'),
    (r'from ["\']\.\.\/\.\.\/components\/NextBombaCard["\']', 'from "../../components/cards/NextBombaCard"'),
    (r'from ["\']\.\.\/components\/NextBombaCard["\']', 'from "../components/cards/NextBombaCard"'),
    
    (r'from ["\']\.\.\/\.\.\/components\/PagamentoReceberCard["\']', 'from "../../components/cards/PagamentoReceberCard"'),
    (r'from ["\']\.\.\/\.\.\/components\/PagamentoReceberCardIntegrado["\']', 'from "../../components/cards/PagamentoReceberCardIntegrado"'),
    (r'from ["\']\.\.\/\.\.\/components\/ExpenseCategoryCard["\']', 'from "../../components/cards/ExpenseCategoryCard"'),
    
    # ==================== MODALS ====================
    (r'from ["\']\.\.\/\.\.\/components\/ConfirmDialog["\']', 'from "../../components/modals/ConfirmDialog"'),
    (r'from ["\']\.\.\/\.\.\/components\/ConfirmationModal["\']', 'from "../../components/modals/ConfirmationModal"'),
    (r'from ["\']\.\.\/\.\.\/components\/PhotoModal["\']', 'from "../../components/modals/PhotoModal"'),
    (r'from ["\']\.\.\/\.\.\/components\/NotaFiscalDetailsModal["\']', 'from "../../components/modals/NotaFiscalDetailsModal"'),
    
    # ==================== EXPORTS ====================
    (r'from ["\']\.\.\/\.\.\/components\/ExportModal["\']', 'from "../../components/exports/ExportModal"'),
    (r'from ["\']\.\.\/\.\.\/components\/ExportButtons["\']', 'from "../../components/exports/ExportButtons"'),
    (r'from ["\']\.\.\/\.\.\/components\/FileDownloadButton["\']', 'from "../../components/exports/FileDownloadButton"'),
    (r'from ["\']\.\.\/\.\.\/components\/DailyExportButton["\']', 'from "../../components/exports/DailyExportButton"'),
    
    # ==================== FORMS ====================
    (r'from ["\']\.\.\/\.\.\/components\/NoteForm["\']', 'from "../../components/forms/NoteForm"'),
    (r'from ["\']\.\.\/\.\.\/components\/ColaboradorForm["\']', 'from "../../components/forms/ColaboradorForm"'),
    (r'from ["\']\.\.\/\.\.\/components\/DependenteForm["\']', 'from "../../components/forms/DependenteForm"'),
    (r'from ["\']\.\.\/\.\.\/components\/DocumentoForm["\']', 'from "../../components/forms/DocumentoForm"'),
    (r'from ["\']\.\.\/\.\.\/components\/HoraExtraForm["\']', 'from "../../components/forms/HoraExtraForm"'),
    
    # ==================== NOTAS FISCAIS ====================
    (r'from ["\']\.\.\/\.\.\/components\/NotaFiscalFormSimple["\']', 'from "../../components/notas-fiscais/NotaFiscalFormSimple"'),
    (r'from ["\']\.\.\/\.\.\/components\/NotaFiscalForm["\']', 'from "../../components/notas-fiscais/NotaFiscalForm"'),
    (r'from ["\']\.\.\/\.\.\/components\/NotasFiscaisLista["\']', 'from "../../components/notas-fiscais/NotasFiscaisLista"'),
    (r'from ["\']\.\.\/\.\.\/components\/NotaFiscalStatusManager["\']', 'from "../../components/notas-fiscais/NotaFiscalStatusManager"'),
    (r'from ["\']\.\.\/\.\.\/components\/NotasFiscaisSyncManager["\']', 'from "../../components/notas-fiscais/NotasFiscaisSyncManager"'),
    
    # ==================== INPUTS COM VALIDAÇÃO ====================
    (r'from ["\']\.\.\/\.\.\/components\/CurrencyInputWithValidation["\']', 'from "../../components/inputs/validation/CurrencyInputWithValidation"'),
    (r'from ["\']\.\.\/\.\.\/components\/PhoneInputWithValidation["\']', 'from "../../components/inputs/validation/PhoneInputWithValidation"'),
    (r'from ["\']\.\.\/\.\.\/components\/DocumentInputWithValidation["\']', 'from "../../components/inputs/validation/DocumentInputWithValidation"'),
    (r'from ["\']\.\.\/\.\.\/components\/CEPInputWithValidation["\']', 'from "../../components/inputs/validation/CEPInputWithValidation"'),
    (r'from ["\']\.\.\/\.\.\/components\/AddressInputWithValidation["\']', 'from "../../components/inputs/validation/AddressInputWithValidation"'),
    (r'from ["\']\.\.\/\.\.\/components\/CityInputWithValidation["\']', 'from "../../components/inputs/validation/CityInputWithValidation"'),
    (r'from ["\']\.\.\/\.\.\/components\/DateInputWithValidation["\']', 'from "../../components/inputs/validation/DateInputWithValidation"'),
    (r'from ["\']\.\.\/\.\.\/components\/CompanyNameInputWithValidation["\']', 'from "../../components/inputs/validation/CompanyNameInputWithValidation"'),
    
    # ==================== PROGRAMAÇÃO ====================
    (r'from ["\']\.\.\/\.\.\/components\/ProgramacaoPavimentacaoForm["\']', 'from "../../components/programacao/ProgramacaoPavimentacaoForm"'),
    (r'from ["\']\.\.\/\.\.\/components\/ProgramacaoCalendar["\']', 'from "../../components/shared/ProgramacaoCalendar"'),
    
    # ==================== CORREÇÕES INTERNAS ====================
    # Dentro de shared, corrigir referências a tipos
    (r'from ["\']\.\.\/types\/', 'from "../../types/'),
    
    # Dentro de layout, corrigir referências
    (r'from ["\']\.\.\/hooks\/', 'from "../../hooks/'),
    (r'from ["\']\.\.\/lib\/', 'from "../../lib/'),
]

def fix_imports_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return filepath
    except Exception as e:
        print(f"❌ Erro em {filepath}: {e}")
    return None

print("🔧 Corrigindo TODOS os imports do projeto...\n")

fixed_files = []
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
            filepath = os.path.join(root, file)
            result = fix_imports_in_file(filepath)
            if result:
                fixed_files.append(result)
                print(f"✅ {os.path.relpath(filepath, base_dir)}")

print(f"\n🎉 TOTAL DE ARQUIVOS CORRIGIDOS: {len(fixed_files)}")
print("\n✅ Todos os imports foram corrigidos com sucesso!")






