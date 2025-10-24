#!/usr/bin/env python3
"""
Script completo para remover todas as referências a bombas de concreto,
WorldRental e FelixMix do projeto WorldPav
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
SRC_DIR = PROJECT_ROOT / "src"

def remove_bomba_fields_from_typescript(content):
    """Remove campos relacionados a bombas de interfaces TypeScript"""
    
    # Remover linhas com campos de bomba
    patterns = [
        r"^\s*bomba_id\??: .*?;\s*$",
        r"^\s*pump_id\??: .*?;\s*$",
        r"^\s*pump_prefix\??: .*?;\s*$",
        r"^\s*auxiliares_bomba\??: .*?;\s*$",
        r"^\s*bomba_prefix\??: .*?;\s*$",
        r"^\s*proxima_bomba\??: .*?$",
        r"^\s*is_terceira\??: .*?;\s*$",
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, "", content, flags=re.MULTILINE)
    
    # Remover interface BombaOption completamente
    content = re.sub(
        r"export interface BombaOption\s*{[^}]*}",
        "",
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Remover comentários sobre bombas
    content = re.sub(r"//.*bomba.*\n", "\n", content, flags=re.IGNORECASE)
    
    return content

def remove_company_enum_values(content):
    """Remove felixmix e worldrental dos enums"""
    
    # Remover do enum z.enum
    content = re.sub(
        r"z\.enum\(\s*\[\s*'felixmix'\s*,\s*'worldrental'\s*\]",
        "z.string().optional()",
        content
    )
    
    # Remover defaultValues
    content = re.sub(
        r"company_logo:\s*initialData\?\.company_logo\s*\|\|\s*'felixmix'",
        "company_logo: initialData?.company_logo || 'worldpav'",
        content
    )
    
    return content

def remove_bomba_jsx_elements(content):
    """Remove elementos JSX relacionados a bombas"""
    
    # Remover card de próxima bomba
    patterns = [
        r"<NextBombaCard[\s\S]*?/>",
        r"{/\*\s*Próxima Bomba[^}]*\*/}[\s\S]*?</div>\s*</div>",
        
        # Remover exibição de bomba_prefix nos cards
        r"{item\.bomba_prefix\s*&&\s*\([\s\S]*?</span>[\s\S]*?\)\s*}",
        r"{item\.bomba_prefix\s*&&[\s\S]*?<span>.*?</span>[\s\S]*?}",
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, "", content, flags=re.MULTILINE)
    
    return content

def remove_bomba_from_api_calls(content):
    """Remove campos de bomba das chamadas de API"""
    
    # Remover seleção de campos bomba
    content = re.sub(r",\s*bomba_id", "", content)
    content = re.sub(r",\s*pump_id", "", content)
    content = re.sub(r",\s*pump_prefix", "", content)
    content = re.sub(r",\s*auxiliares_bomba", "", content)
    
    # Remover joins com tabela pumps
    content = re.sub(
        r"\.select\([^)]*pumps[^)]*\)",
        lambda m: m.group(0).replace("pumps:*,", "").replace(", pumps:*", ""),
        content
    )
    
    return content

def clean_file(filepath):
    """Limpa um arquivo de todas as referências a bombas"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Aplicar todas as limpezas
        content = remove_bomba_fields_from_typescript(content)
        content = remove_company_enum_values(content)
        content = remove_bomba_jsx_elements(content)
        content = remove_bomba_from_api_calls(content)
        
        # Substituições simples
        content = re.sub(r"bombas programadas", "serviços programados", content, flags=re.IGNORECASE)
        content = re.sub(r"bomba de concreto", "equipamento", content, flags=re.IGNORECASE)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"❌ Erro: {filepath}: {e}")
        return False

def scan_and_clean(directory):
    """Escaneia e limpa todos os arquivos"""
    cleaned = []
    
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = Path(root) / file
                if clean_file(filepath):
                    cleaned.append(filepath.relative_to(PROJECT_ROOT))
    
    return cleaned

def main():
    print("🧹 Limpeza completa de bombas, WorldRental e FelixMix\n")
    
    # Deletar NextBombaCard se ainda existir
    bomba_card = SRC_DIR / "components/cards/NextBombaCard.tsx"
    if bomba_card.exists():
        os.remove(bomba_card)
        print(f"🗑️  Deletado: NextBombaCard.tsx")
    
    # Limpar arquivos
    print("\n🔍 Limpando referências...")
    cleaned = scan_and_clean(SRC_DIR)
    
    print(f"\n✅ Concluído!")
    print(f"   📝 {len(cleaned)} arquivo(s) limpo(s)")
    
    if cleaned:
        print("\n📝 Arquivos modificados:")
        for file in cleaned[:30]:
            print(f"   - {file}")
        if len(cleaned) > 30:
            print(f"   ... e mais {len(cleaned) - 30}")

if __name__ == "__main__":
    main()




