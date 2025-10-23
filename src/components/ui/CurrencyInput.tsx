import React, { useState, useEffect } from 'react'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = "0,00", 
  className = "",
  disabled = false,
  error = false
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Atualiza o valor de exibição quando o valor prop muda
  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatCurrencyDisplay(value))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const formatCurrencyDisplay = (val: number): string => {
    return val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    // Remove tudo que não é dígito ou vírgula
    inputValue = inputValue.replace(/[^\d,]/g, '')

    // Garante apenas uma vírgula
    const parts = inputValue.split(',')
    if (parts.length > 2) {
      inputValue = parts[0] + ',' + parts.slice(1).join('')
    }

    // Limita a 2 casas decimais após a vírgula
    if (parts[1] && parts[1].length > 2) {
      inputValue = parts[0] + ',' + parts[1].substring(0, 2)
    }

    setDisplayValue(inputValue)

    // Converte para número e chama onChange
    const numericValue = inputValue ? parseFloat(inputValue.replace(',', '.')) : 0
    onChange(numericValue)
  }

  const handleBlur = () => {
    // Formata o valor quando o usuário sai do campo
    if (value > 0) {
      setDisplayValue(formatCurrencyDisplay(value))
    }
  }

  const handleFocus = () => {
    // Remove a formatação quando o usuário foca no campo para facilitar a edição
    if (value > 0) {
      setDisplayValue(value.toString().replace('.', ','))
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    />
  )
}