"use client"

import React, { useState } from "react"
import { parseDate, today, getLocalTimeZone } from "@internationalized/date"
import {
  JollyCalendar,
} from "@/components/ui/range-calendar"
import { Calendar, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { TIMEZONE, formatDateStringToBR } from "@/utils/date-utils"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label: string
  placeholder?: string
  minDate?: string
  maxDate?: string
  required?: boolean
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder,
  minDate,
  maxDate,
  required = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Usar timezone de São Paulo para todas as operações de data
  const saoPauloTimeZone = TIMEZONE // 'America/Sao_Paulo'
  
  // Converter string para DateValue ou usar hoje como padrão no timezone de São Paulo
  const selectedDate = value && value.trim() ? parseDate(value) : today(saoPauloTimeZone)
  
  // Converter min/max dates
  const minDateValue = minDate && minDate.trim() ? parseDate(minDate) : undefined
  const maxDateValue = maxDate && maxDate.trim() ? parseDate(maxDate) : undefined

  const handleDateChange = (date: any) => {
    // Converter para formato YYYY-MM-DD para evitar problemas de fuso horário
    const year = date.year
    const month = String(date.month).padStart(2, '0')
    const day = String(date.day).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    console.log('🗓️ [DatePicker] Data selecionada:', {
      original: date,
      year,
      month,
      day,
      dateString,
      formatted: formatDateStringToBR(dateString)
    })
    
    onChange(dateString)
    setIsOpen(false)
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder || "Selecionar data"
    
    // Usar função utilitária para formatação consistente
    const formatted = formatDateStringToBR(dateString)
    
    console.log('📅 [DatePicker] Formatando data:', {
      input: dateString,
      output: formatted
    })
    
    return formatted
  }

  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md text-left font-normal",
            "bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
            !value && "text-gray-500",
            error && "border-red-300"
          )}
        >
          <Calendar className="mr-2 h-4 w-4 inline" />
          {formatDisplayDate(value)}
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Selecionar Data</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <JollyCalendar
                value={selectedDate}
                onChange={handleDateChange}
                minValue={minDateValue}
                maxValue={maxDateValue}
                className="border-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Dicas de validação */}
      {minDate && (
        <div className="text-xs text-gray-500">
          Data mínima: {formatDateStringToBR(minDate)}
        </div>
      )}
      
      {maxDate && (
        <div className="text-xs text-gray-500">
          Data máxima: {formatDateStringToBR(maxDate)}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

