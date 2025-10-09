import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value?: number
  onChange?: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: number
  max?: number
}

export function CurrencyInput({
  value = 0,
  onChange,
  placeholder = 'R$ 0,00',
  className,
  disabled = false,
  min = 0,
  max
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Formatar valor numérico para moeda brasileira
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  // Atualizar display quando o valor externo mudar
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatCurrency(value))
    }
  }, [value])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value

    // Remove todos os caracteres não numéricos
    valor = valor.replace(/\D/g, '')

    // Se estiver vazio, definir como 0
    if (!valor) {
      setDisplayValue('')
      onChange?.(0)
      return
    }

    // Converte para número e divide por 100 para considerar as casas decimais
    const numValue = Number(valor) / 100

    // Validar min e max
    if (min !== undefined && numValue < min) {
      return
    }
    if (max !== undefined && numValue > max) {
      return
    }

    // Atualiza o valor formatado no campo de entrada
    const formattedValue = formatCurrency(numValue)
    setDisplayValue(formattedValue)
    
    // Notificar mudança
    onChange?.(numValue)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Selecionar todo o texto ao focar
    setTimeout(() => {
      e.target.select()
    }, 0)
  }

  const handleBlur = () => {
    // Se o campo estiver vazio, definir como 0
    if (!displayValue.trim()) {
      setDisplayValue(formatCurrency(0))
      onChange?.(0)
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onInput={handleInput}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
        'transition-colors',
        className
      )}
      inputMode="numeric"
      autoComplete="off"
    />
  )
}

