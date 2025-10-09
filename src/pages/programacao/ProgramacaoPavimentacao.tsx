import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ProgramacaoPavimentacaoForm } from '../../components/ProgramacaoPavimentacaoForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function ProgramacaoPavimentacao() {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log('✅ Programação enviada:', data);
    
    // Aqui você pode adicionar a lógica para salvar no Supabase
    // Por exemplo:
    // await supabase.from('programacoes').insert({...})
    
    // Redirecionar para lista de programações após salvar
    // navigate('/programacao');
  };

  const handleCancel = () => {
    navigate('/programacao');
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Programação
          </Button>
        </div>

        <ProgramacaoPavimentacaoForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}

