#!/bin/bash

# Script para corrigir TODOS os imports do projeto

cd "/Users/viniciusambrozio/Downloads/MARKETING DIGITAL/PROGRAMAS/GESTÃO ASFALTO/Worldpav"

echo "🔧 Corrigindo imports..."

# Corrigir Layout
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../../components/Layout"|from "../../components/layout/Layout"|g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../components/Layout"|from "../components/layout/Layout"|g' {} \;

# Corrigir Button
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../Button"|from "../shared/Button"|g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../../components/Button"|from "../../components/shared/Button"|g' {} \;

# Corrigir Select
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../Select"|from "../shared/Select"|g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../../components/Select"|from "../../components/shared/Select"|g' {} \;

# Corrigir Loading
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../Loading"|from "../shared/Loading"|g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../../components/Loading"|from "../../components/shared/Loading"|g' {} \;

# Corrigir FileDownloadButton
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../../components/FileDownloadButton"|from "../../components/exports/FileDownloadButton"|g' {} \;

# Corrigir NotePreview
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|from "../../components/NotePreview"|from "../../components/shared/NotePreview"|g' {} \;

echo "✅ Imports corrigidos!"






