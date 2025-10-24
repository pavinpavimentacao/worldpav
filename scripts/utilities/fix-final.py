#!/usr/bin/env python3
import os
import re

base_dir = "/Users/viniciusambrozio/Downloads/MARKETING DIGITAL/PROGRAMAS/GESTÃO ASFALTO/Worldpav/src"

# Todos os componentes que foram movidos para shared/
replacements = [
    # ServicoSelector
    (r'from ["\']\.\.\/\.\.\/components\/ServicoSelector["\']', 'from "../../components/shared/ServicoSelector"'),
    (r'from ["\']\.\.\/ServicoSelector["\']', 'from "../shared/ServicoSelector"'),
    
    # CompanySelector
    (r'from ["\']\.\.\/\.\.\/components\/CompanySelector["\']', 'from "../../components/shared/CompanySelector"'),
    (r'from ["\']\.\.\/CompanySelector["\']', 'from "../shared/CompanySelector"'),
    
    # UFSelector
    (r'from ["\']\.\.\/\.\.\/components\/UFSelector["\']', 'from "../../components/shared/UFSelector"'),
    (r'from ["\']\.\.\/UFSelector["\']', 'from "../shared/UFSelector"'),
    
    # FloatingSelect
    (r'from ["\']\.\.\/\.\.\/components\/FloatingSelect["\']', 'from "../../components/shared/FloatingSelect"'),
    (r'from ["\']\.\.\/FloatingSelect["\']', 'from "../shared/FloatingSelect"'),
    
    # MultiSelect
    (r'from ["\']\.\.\/\.\.\/components\/MultiSelect["\']', 'from "../../components/shared/MultiSelect"'),
    (r'from ["\']\.\.\/MultiSelect["\']', 'from "../shared/MultiSelect"'),
    
    # Table
    (r'from ["\']\.\.\/\.\.\/components\/Table["\']', 'from "../../components/shared/Table"'),
    (r'from ["\']\.\.\/Table["\']', 'from "../shared/Table"'),
    
    # FormField
    (r'from ["\']\.\.\/\.\.\/components\/FormField["\']', 'from "../../components/shared/FormField"'),
    (r'from ["\']\.\.\/FormField["\']', 'from "../shared/FormField"'),
    
    # TextAreaWithCounter
    (r'from ["\']\.\.\/\.\.\/components\/TextAreaWithCounter["\']', 'from "../../components/shared/TextAreaWithCounter"'),
    (r'from ["\']\.\.\/TextAreaWithCounter["\']', 'from "../shared/TextAreaWithCounter"'),
    
    # PhotoUpload
    (r'from ["\']\.\.\/\.\.\/components\/PhotoUpload["\']', 'from "../../components/shared/PhotoUpload"'),
    (r'from ["\']\.\.\/PhotoUpload["\']', 'from "../shared/PhotoUpload"'),
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
            return True
    except Exception as e:
        print(f"Erro em {filepath}: {e}")
    return False

fixed_count = 0
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
            filepath = os.path.join(root, file)
            if fix_imports_in_file(filepath):
                fixed_count += 1

print(f"✅ Total de arquivos corrigidos: {fixed_count}")






