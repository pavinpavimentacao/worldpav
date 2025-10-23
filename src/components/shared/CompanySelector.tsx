import React from 'react';

interface CompanySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Componente para exibição da empresa WorldPav
 * Mantido por compatibilidade, mas agora fixo em WorldPav
 */
export const CompanySelector: React.FC<CompanySelectorProps> = ({ 
  value, 
  onChange, 
  error,
  disabled = false 
}) => {
  // Garantir que sempre seja worldpav
  React.useEffect(() => {
    if (value !== 'worldpav') {
      onChange('worldpav');
    }
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Empresa
      </label>
      
      <div className="relative p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
        {/* Checkbox visual */}
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="text-left">
          <div className="font-semibold text-blue-700">
            WorldPav
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Pavimentação Asfáltica
          </div>
        </div>

        {/* Logo */}
        <div className="mt-3 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <div className="text-2xl font-bold text-blue-700">
            WP
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
