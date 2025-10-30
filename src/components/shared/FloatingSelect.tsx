import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import {
  FloatingActionPanelRoot,
  FloatingActionPanelTrigger,
  FloatingActionPanelContent,
  FloatingActionPanelButton,
} from "@/components/ui/floating-action-panel"
import { cn } from "@/lib/utils"

interface FloatingSelectOption {
  value: string
  label: string
}

interface FloatingSelectProps {
  value?: string
  onChange: (value: string) => void
  options: FloatingSelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
  label?: string
}

export const FloatingSelect: React.FC<FloatingSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className,
  disabled = false,
  error,
  label
}) => {
  const safeOptions = options || []
  const selectedOption = safeOptions.find(opt => opt.value === value)

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <FloatingActionPanelRoot>
        {({ closePanel }) => (
          <>
            <FloatingActionPanelTrigger 
              title={label || "Selecione uma opção"} 
              mode="actions"
              className={cn(
                "w-full justify-between !bg-white !border-gray-300 !text-gray-900 hover:!bg-gray-50 !shadow-sm !rounded-md !px-3 !py-2 !min-h-[40px]",
                error && "!border-red-300",
                disabled && "!opacity-50 !cursor-not-allowed"
              )}
            >
              <span className={cn(
                "flex-1 text-left !text-gray-900",
                !selectedOption && "!text-gray-500"
              )}>
                {selectedOption?.label || placeholder}
              </span>
              <ChevronDown className="h-4 w-4 !text-gray-500" />
            </FloatingActionPanelTrigger>

            <FloatingActionPanelContent className="max-h-[300px] overflow-y-auto !bg-white !border-gray-200 !shadow-lg">
              <div className="space-y-1 p-2">
                {safeOptions.map((option) => (
                  <FloatingActionPanelButton
                    key={option.value}
                    onClick={(e) => {
                      console.log('🔍 [FloatingSelect] Clique na opção:', option.label, 'value:', option.value)
                      e.preventDefault()
                      e.stopPropagation()
                      try {
                        onChange(option.value)
                        console.log('✅ [FloatingSelect] onChange chamado com sucesso')
                      } catch (error) {
                        console.error('❌ [FloatingSelect] Erro ao chamar onChange:', error)
                      }
                      closePanel()
                    }}
                    className={cn(
                      "justify-between !text-gray-900 hover:!bg-gray-100 !cursor-pointer",
                      option.value === value && "!bg-blue-50 !text-blue-600 !font-medium hover:!bg-blue-100"
                    )}
                    disabled={disabled}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <Check className="h-4 w-4" />
                    )}
                  </FloatingActionPanelButton>
                ))}
              </div>
            </FloatingActionPanelContent>
          </>
        )}
      </FloatingActionPanelRoot>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}



