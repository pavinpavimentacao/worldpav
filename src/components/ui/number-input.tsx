import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"

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

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({
    value,
    onChange,
    onBlur,
    placeholder = '',
    className = '',
    disabled = false,
    min,
    max,
    step = 1,
    decimals = 2,
    ...props
  }, ref) => {
    const [displayValue, setDisplayValue] = useState('')

    // Atualizar display quando o 'value' prop mudar externamente
    useEffect(() => {
      // Se o valor for 0, exibe string vazia. Caso contrário, exibe o número como string.
      // Formatação simples para até 6 dígitos
      if (value !== null && value !== undefined && value !== 0) {
        const formatted = value.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        })
        setDisplayValue(formatted)
      } else {
        setDisplayValue('')
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setDisplayValue(inputValue) // Atualiza o display com a entrada bruta do usuário

      // Converte a string de entrada para um número para o callback onChange
      // Remove pontos (separadores de milhares) e substitui vírgula por ponto para parseFloat
      const cleanValue = inputValue.replace(/\./g, '').replace(',', '.')
      const numericValue = parseFloat(cleanValue)

      if (!isNaN(numericValue)) {
        onChange(numericValue)
      } else if (inputValue === '' || inputValue === '-') {
        onChange(0) // Se a entrada estiver vazia ou for apenas um sinal negativo, trata como 0
      } else {
        onChange(0) // Padrão para 0 se a análise falhar
      }
    }

    const handleBlur = () => {
      // Formatar ao sair do campo
      const cleanValue = displayValue.replace(/\./g, '').replace(',', '.')
      const numericValue = parseFloat(cleanValue)
      
      if (!isNaN(numericValue) && numericValue > 0) {
        const formatted = numericValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        })
        setDisplayValue(formatted)
      } else {
        setDisplayValue('')
      }
      
      onBlur?.()
    }

    return (
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        disabled={disabled}
        {...props}
        ref={ref}
      />
    )
  }
)

NumberInput.displayName = "NumberInput"