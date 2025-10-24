#!/usr/bin/env python3
"""
Script para remover todas as referências a bombas de concreto, WorldRental e FelixMix
do projeto WorldPav
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
SRC_DIR = PROJECT_ROOT / "src"

# Arquivos para deletar completamente
FILES_TO_DELETE = [
    "src/components/cards/NextBombaCard.tsx",
]

# Padrões para substituir em arquivos
REPLACEMENTS = [
    # Remover imports do NextBombaCard
    (r"import\s*{\s*NextBombaCard\s*}\s*from\s*['\"].*NextBombaCard['\"];?\s*\n", ""),
    
    # Remover uso do NextBombaCard no JSX
    (r"<NextBombaCard[\s\S]*?/>", ""),
    (r"{/\*\s*Próxima Bomba.*?\*/}[\s\S]*?</div>", ""),
    
    # Remover referências a bomba_prefix
    (r"item\.bomba_prefix\s*&&[\s\S]*?</span>[\s\S]*?}", ""),
    (r"{item\.bomba_prefix\s*&&[\s\S]*?}", ""),
    
    # Substituir "bombas programadas" por "serviços programados"  
    (r"bombas programadas", "serviços programados"),
    
    # Remover opções WorldRental e FelixMix
    (r"<option value=['\"]felixmix['\"]>.*?</option>\s*", ""),
    (r"<option value=['\"]worldrental['\"]>.*?</option>\s*", ""),
    
    # Remover do enum
    (r"company_logo:\s*z\.enum\(\['felixmix',\s*'worldrental'\][^)]*\)", 
     "company_logo: z.string().optional()"),
    
    # Remover defaultValues com felixmix
    (r"company_logo:\s*initialData\?\.company_logo\s*\|\|\s*'felixmix'",
     "company_logo: initialData?.company_logo || ''"),
     
    # Remover comentários sobre bombas
    (r"//.*bomba.*\n", ""),
    (r"/\*.*bomba.*\*/", ""),
]

def delete_files():
    """Deleta arquivos que devem ser removidos completamente"""
    deleted = []
    for file_path in FILES_TO_DELETE:
        full_path = PROJECT_ROOT / file_path
        if full_path.exists():
            os.remove(full_path)
            deleted.append(str(full_path.relative_to(PROJECT_ROOT)))
            print(f"🗑️  Deletado: {file_path}")
    return deleted

def clean_file_content(content):
    """Aplica todas as substituições no conteúdo do arquivo"""
    original = content
    for pattern, replacement in REPLACEMENTS:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE | re.MULTILINE)
    return content, content != original

def process_file(filepath):
    """Processa um arquivo aplicando as limpezas"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        cleaned_content, changed = clean_file_content(content)
        
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            return True
        return False
    except Exception as e:
        print(f"❌ Erro ao processar {filepath}: {e}")
        return False

def scan_and_clean(directory, extensions=['.ts', '.tsx', '.js', '.jsx']):
    """Escaneia e limpa todos os arquivos relevantes"""
    cleaned_files = []
    
    for root, dirs, files in os.walk(directory):
        # Ignorar node_modules e outros diretórios
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = Path(root) / file
                if process_file(filepath):
                    cleaned_files.append(filepath.relative_to(PROJECT_ROOT))
    
    return cleaned_files

def main():
    print("🧹 Iniciando limpeza de referências a bombas, WorldRental e FelixMix...\n")
    
    # Deletar arquivos
    print("📁 Deletando arquivos...")
    deleted = delete_files()
    
    # Limpar referências nos arquivos restantes
    print("\n🔍 Limpando referências em arquivos...")
    cleaned = scan_and_clean(SRC_DIR)
    
    # Relatório final
    print(f"\n✅ Limpeza concluída!")
    print(f"   📁 {len(deleted)} arquivo(s) deletado(s)")
    print(f"   📝 {len(cleaned)} arquivo(s) limpo(s)")
    
    if cleaned:
        print("\n📝 Arquivos modificados:")
        for file in cleaned[:20]:  # Mostrar no máximo 20
            print(f"   - {file}")
        if len(cleaned) > 20:
            print(f"   ... e mais {len(cleaned) - 20} arquivos")

if __name__ == "__main__":
    main()




