import React, { useState, useEffect } from 'react'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  decimals?: number
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = '',
  className = '',
  disabled = false,
  min,
  max,
  step = 1,
  decimals = 2
}) => {
  const [displayValue, setDisplayValue] = useState('')

  // Formatar número para padrão brasileiro
  const formatNumber = (num: number): string => {
    if (isNaN(num) || num === null || num === undefined || num === 0) return ''
    
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  // Atualizar display quando value mudar externamente
  useEffect(() => {
    setDisplayValue(formatNumber(value))
  }, [value, decimals])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Permitir apenas números e vírgula
    const sanitized = inputValue.replace(/[^0-9,]/g, '')
    
    // Limitar a uma vírgula
    const parts = sanitized.split(',')
    if (parts.length > 2) {
      return
    }
    
    // Limitar casas decimais após a vírgula
    if (parts.length === 2 && parts[1].length > decimals) {
      return
    }
    
    setDisplayValue(sanitized)
    
    // Converter para número
    const numericValue = sanitized === '' ? 0 : parseFloat(sanitized.replace(',', '.'))
    
    // Aplicar limites
    let finalValue = numericValue
    if (min !== undefined && finalValue < min) finalValue = min
    if (max !== undefined && finalValue > max) finalValue = max
    
    onChange(finalValue)
  }

  const handleBlur = () => {
    // Formatar ao sair do campo
    const numericValue = displayValue === '' ? 0 : parseFloat(displayValue.replace(/\./g, '').replace(',', '.'))
    setDisplayValue(formatNumber(numericValue))
    onBlur?.()
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
    />
  )
}

