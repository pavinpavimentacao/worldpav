#!/usr/bin/env python3
"""
Script para corrigir imports sistemáticos no projeto Worldpav
"""

import os
import re
from pathlib import Path

# Diretório raiz do projeto
PROJECT_ROOT = Path(__file__).parent
SRC_DIR = PROJECT_ROOT / "src"

# Padrões de correção
# Formato: (pattern_to_find, replacement, description)
CORRECTIONS = [
    # Correções para arquivos em src/utils/
    (r"from ['\"]\.\.\/\.\.\/lib\/", "from '../lib/", "utils -> lib"),
    (r"from ['\"]\.\.\/\.\.\/types\/", "from '../types/", "utils -> types"),
    
    # Correções para arquivos em src/pages/
    (r"from ['\"]\.\.\/\.\.\/lib\/", "from '../lib/", "pages -> lib"),
    (r"from ['\"]\.\.\/\.\.\/types\/", "from '../types/", "pages -> types"),
    (r"from ['\"]\.\.\/\.\.\/utils\/", "from '../utils/", "pages -> utils"),
    (r"from ['\"]\.\.\/\.\.\/hooks\/", "from '../hooks/", "pages -> hooks"),
    
    # Correções para arquivos em src/components/
    (r"from ['\"]\.\.\/utils\/", "from '../../utils/", "components/subdir -> utils"),
    (r"from ['\"]\.\.\/lib\/", "from '../../lib/", "components/subdir -> lib"),
]

def fix_file(filepath):
    """Corrige os imports em um arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = []
        
        for pattern, replacement, description in CORRECTIONS:
            matches = re.findall(pattern, content)
            if matches:
                content = re.sub(pattern, replacement, content)
                changes.append((description, len(matches)))
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return changes
        return None
        
    except Exception as e:
        print(f"❌ Erro ao processar {filepath}: {e}")
        return None

def scan_and_fix(directory, extensions=['.ts', '.tsx']):
    """Escaneia e corrige todos os arquivos TypeScript/TSX"""
    fixed_files = []
    
    for root, dirs, files in os.walk(directory):
        # Ignorar node_modules e outros diretórios
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = Path(root) / file
                changes = fix_file(filepath)
                if changes:
                    fixed_files.append((filepath, changes))
    
    return fixed_files

def main():
    print("🔧 Iniciando correção sistemática de imports...")
    print(f"📁 Diretório: {SRC_DIR}\n")
    
    fixed_files = scan_and_fix(SRC_DIR)
    
    if fixed_files:
        print(f"\n✅ {len(fixed_files)} arquivo(s) corrigido(s):\n")
        for filepath, changes in fixed_files:
            relative_path = filepath.relative_to(PROJECT_ROOT)
            print(f"  📝 {relative_path}")
            for desc, count in changes:
                print(f"     - {desc}: {count} correção(ões)")
    else:
        print("\n✨ Nenhuma correção necessária!")
    
    print("\n🎉 Processo concluído!")

if __name__ == "__main__":
    main()




