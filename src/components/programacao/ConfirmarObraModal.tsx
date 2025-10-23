import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Calendar, MapPin, Users, Truck, FileText, Upload, Image as ImageIcon, Building2 } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { DatePicker } from '../ui/date-picker';
import { CalculadoraEspessura } from '../relatorios-diarios/CalculadoraEspessura';
import { toast } from '../../lib/toast-hooks';
import type { ProgramacaoPavimentacao } from '../../types/programacao-pavimentacao';
import { formatDateBR } from '../../utils/date-format';

interface ConfirmarObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  programacao: ProgramacaoPavimentacao;
  onConfirmar: (dados: DadosConfirmacaoObra) => Promise<void>;
}

export interface DadosConfirmacaoObra {
  data_fim: string;
  horario_fim: string;
  metragem_feita: number;
  toneladas_aplicadas: number;
  observacoes?: string;
  fotos_obra?: File[];
}

export const ConfirmarObraModal: React.FC<ConfirmarObraModalProps> = ({
  isOpen,
  onClose,
  programacao,
  onConfirmar,
}) => {
  // Estados do formulário - apenas o que precisa ser preenchido
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [horarioFim, setHorarioFim] = useState(new Date().toTimeString().slice(0, 5));
  const [metragemFeita, setMetragemFeita] = useState(programacao.metragem_prevista.toString());
  const [toneladasAplicadas, setToneladasAplicadas] = useState(programacao.quantidade_toneladas.toString());
  const [observacoes, setObservacoes] = useState('');
  const [fotosObra, setFotosObra] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Cálculo de espessura
  const metragem = parseFloat(metragemFeita) || 0;
  const toneladas = parseFloat(toneladasAplicadas) || 0;
  const espessuraCalculada = metragem > 0 && toneladas > 0
    ? (toneladas / metragem) * 4.17
    : 0;

  if (!isOpen) return null;

  const handleAddFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar quantidade total
    if (fotosObra.length + files.length > 10) {
      toast.error('Máximo de 10 fotos permitidas');
      return;
    }

    // Validar cada arquivo
    const fotosValidas: File[] = [];
    const previewsTemp: string[] = [];

    files.forEach(file => {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo 5MB`);
        return;
      }

      fotosValidas.push(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        previewsTemp.push(reader.result as string);
        if (previewsTemp.length === fotosValidas.length) {
          setPreviewUrls([...previewUrls, ...previewsTemp]);
        }
      };
      reader.readAsDataURL(file);
    });

    setFotosObra([...fotosObra, ...fotosValidas]);
    e.target.value = '';
  };

  const handleRemoverFoto = (index: number) => {
    setFotosObra(fotosObra.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const metragemNum = parseFloat(metragemFeita);
    const toneladasNum = parseFloat(toneladasAplicadas);

    if (isNaN(metragemNum) || metragemNum <= 0) {
      setError('Metragem deve ser maior que 0');
      return;
    }

    if (isNaN(toneladasNum) || toneladasNum <= 0) {
      setError('Toneladas devem ser maior que 0');
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirmar({
        data_fim: dataFim,
        horario_fim: horarioFim,
        metragem_feita: metragemNum,
        toneladas_aplicadas: toneladasNum,
        observacoes: observacoes.trim() || undefined,
        fotos_obra: fotosObra.length > 0 ? fotosObra : undefined,
      });

      toast.success('Obra confirmada com sucesso! Rua finalizada e relatório criado.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao confirmar obra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 rounded-lg p-2">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Finalização da Obra
              </h3>
              <p className="text-sm text-gray-600">
                Preencha os dados executados para finalizar a rua
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alertas */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Informações Pré-preenchidas (apenas visualização) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Informações da Programação</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium text-gray-900">{programacao.cliente_nome}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Obra:</span>
                <span className="font-medium text-gray-900">{programacao.obra}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Rua:</span>
                <span className="font-medium text-gray-900">{programacao.rua}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Data Programada:</span>
                <span className="font-medium text-gray-900">{formatDateBR(programacao.data)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Equipe:</span>
                <span className="font-medium text-gray-900">{programacao.prefixo_equipe}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Maquinários:</span>
                <span className="font-medium text-gray-900">{programacao.maquinarios.length} equipamentos</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Previsão:</strong> {programacao.metragem_prevista.toLocaleString()}m² • {programacao.quantidade_toneladas.toLocaleString()}t
              </p>
            </div>
          </div>

          {/* Dados de Finalização */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Dados da Execução</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data de Finalização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Finalização <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Horário de Finalização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário de Término <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={horarioFim}
                  onChange={(e) => setHorarioFim(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Metragem Executada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metragem Executada (m²) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={metragemFeita}
                  onChange={(e) => setMetragemFeita(e.target.value)}
                  placeholder="Ex: 1450.50"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Previsto: {programacao.metragem_prevista.toLocaleString()}m²
                </p>
              </div>

              {/* Toneladas Aplicadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toneladas Aplicadas (t) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={toneladasAplicadas}
                  onChange={(e) => setToneladasAplicadas(e.target.value)}
                  placeholder="Ex: 145.5"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Previsto: {programacao.quantidade_toneladas.toLocaleString()}t
                </p>
              </div>
            </div>

            {/* Calculadora de Espessura */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <CalculadoraEspessura
                metragem={metragem}
                toneladas={toneladas}
                espessuraCalculada={espessuraCalculada}
              />
            </div>
          </div>

          {/* Upload de Fotos da Obra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos da Obra Concluída
              <span className="text-gray-500 text-xs ml-1">(opcional - até 10 fotos)</span>
            </label>

            {/* Preview das fotos */}
            {fotosObra.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                      {(fotosObra[index].size / 1024).toFixed(0)}KB
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload */}
            {fotosObra.length < 10 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  onChange={handleAddFotos}
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                  disabled={isSubmitting}
                />
                <div className="mt-2 text-center">
                  <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">
                    JPG ou PNG até 5MB cada • {fotosObra.length}/10 fotos
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Observações sobre a execução da obra..."
              disabled={isSubmitting}
            />
          </div>

          {/* Resumo do que será feito */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-900 mb-1">
                  Ao confirmar, o sistema irá:
                </h4>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Marcar a rua <strong>{programacao.rua}</strong> como <strong>FINALIZADA</strong></li>
                  <li>Criar automaticamente um <strong>Relatório Diário</strong></li>
                  <li>Gerar o <strong>Faturamento</strong> da rua executada</li>
                  <li>Salvar {fotosObra.length > 0 ? `${fotosObra.length} foto(s)` : 'os dados'} da execução</li>
                  <li>Atualizar as estatísticas da obra</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Finalização
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

