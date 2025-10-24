import React, { useState, useEffect } from 'react'

interface CnpjInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const CnpjInput: React.FC<CnpjInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = '00.000.000/0000-00',
  className = '',
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState('')

  // Formatar CNPJ para padrão brasileiro
  const formatCnpj = (cnpj: string): string => {
    if (!cnpj) return ''
    
    // Remove tudo que não é número
    const numbers = cnpj.replace(/\D/g, '')
    
    // Limita a 14 dígitos
    const limitedNumbers = numbers.slice(0, 14)
    
    // Aplica a máscara: XX.XXX.XXX/XXXX-XX
    if (limitedNumbers.length <= 2) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 5) {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2)}`
    } else if (limitedNumbers.length <= 8) {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5)}`
    } else if (limitedNumbers.length <= 12) {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8)}`
    } else {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8, 12)}-${limitedNumbers.slice(12)}`
    }
  }

  // Atualizar display quando value mudar externamente
  useEffect(() => {
    setDisplayValue(formatCnpj(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Remove caracteres não numéricos
    const numbers = inputValue.replace(/\D/g, '')
    
    // Limita a 14 dígitos
    const limitedNumbers = numbers.slice(0, 14)
    
    // Formata o CNPJ
    const formatted = formatCnpj(limitedNumbers)
    
    setDisplayValue(formatted)
    onChange(limitedNumbers) // Salva apenas os números
  }

  const handleBlur = () => {
    // Garante formatação completa ao sair
    const formatted = formatCnpj(value)
    setDisplayValue(formatted)
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas números, backspace, delete, tab, escape, enter
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ]
    
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return
    }
    
    // Bloqueia qualquer outra tecla que não seja número
    if (!/\d/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
      maxLength={18} // XX.XXX.XXX/XXXX-XX = 18 caracteres
    />
  )
}

