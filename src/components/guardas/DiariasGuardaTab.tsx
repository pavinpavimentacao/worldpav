/**
 * Tab: Diárias de Guarda
 * Registro de diárias com maquinários e upload de fotos
 */

import React, { useState } from 'react';
import { Plus, Calendar, MapPin, DollarSign, Clock, Truck, Upload, X, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { toast } from '../../lib/toast-hooks';
import {
  mockDiariasGuarda,
  mockGuardas,
  adicionarDiariaGuarda,
} from '../../mocks/guardas-mock';
import {
  getLabelTurno,
  getCorTurno,
  getIconeTurno,
  getTurnosDisponiveis,
  type TurnoGuarda,
  type DiariaGuardaCompleta,
} from '../../types/guardas';
import { formatDateBR } from '../../utils/date-format';

// Mock de maquinários (substituir por dados reais)
const mockMaquinariosDisponiveis = [
  { id: 'maq-001', nome: 'Vibroacabadora CAT AP1055F' },
  { id: 'maq-002', nome: 'Rolo Compactador BOMAG BW213' },
  { id: 'maq-003', nome: 'Caminhão Basculante Mercedes 2729' },
  { id: 'maq-004', nome: 'Escavadeira Hidráulica CAT 320D' },
  { id: 'maq-005', nome: 'Caminhão Espargidor Volvo FM 370' },
];

interface DiariasGuardaTabProps {
  diariasFiltradas?: DiariaGuardaCompleta[];
  onDiariasChange?: () => void;
}

export const DiariasGuardaTab: React.FC<DiariasGuardaTabProps> = ({ 
  diariasFiltradas = mockDiariasGuarda,
  onDiariasChange 
}) => {
  const [diarias, setDiarias] = useState(mockDiariasGuarda);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [diariaSelecionada, setDiariaSelecionada] = useState<DiariaGuardaCompleta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [guardaId, setGuardaId] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [dataDiaria, setDataDiaria] = useState(new Date().toISOString().split('T')[0]);
  const [turno, setTurno] = useState<TurnoGuarda>('noite');
  const [rua, setRua] = useState('');
  const [maquinariosSelecionados, setMaquinariosSelecionados] = useState<string[]>([]);
  const [fotoMaquinario, setFotoMaquinario] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');

  const guardasAtivos = mockGuardas.filter((g) => g.ativo);

  const handleOpenModal = () => {
    limparFormulario();
    setShowModal(true);
  };

  const limparFormulario = () => {
    setGuardaId(guardasAtivos[0]?.id || '');
    setSolicitante('');
    setValorDiaria('');
    setDataDiaria(new Date().toISOString().split('T')[0]);
    setTurno('noite');
    setRua('');
    setMaquinariosSelecionados([]);
    setFotoMaquinario(null);
    setPreviewUrl(null);
    setObservacoes('');
  };

  const handleToggleMaquinario = (maquinarioId: string) => {
    setMaquinariosSelecionados((prev) =>
      prev.includes(maquinarioId)
        ? prev.filter((id) => id !== maquinarioId)
        : [...prev, maquinarioId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    setFotoMaquinario(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverFoto = () => {
    setFotoMaquinario(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validações
    if (!guardaId || !solicitante.trim() || !valorDiaria || !rua.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      setIsSubmitting(false);
      return;
    }

    if (maquinariosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um maquinário');
      setIsSubmitting(false);
      return;
    }

    const valorNum = parseFloat(valorDiaria);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('Valor da diária inválido');
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simular upload da foto
      let fotoUrl: string | undefined;
      if (fotoMaquinario) {
        fotoUrl = `https://placehold.co/600x400/png?text=Foto+${Date.now()}`;
        console.log('✅ Foto enviada:', fotoMaquinario.name);
      }

      const novaDiaria = adicionarDiariaGuarda({
        guarda_id: guardaId,
        solicitante: solicitante.trim(),
        valor_diaria: valorNum,
        data_diaria: dataDiaria,
        turno,
        rua: rua.trim(),
        maquinarios_ids: maquinariosSelecionados,
        foto_maquinario_url: fotoUrl,
        observacoes: observacoes.trim() || undefined,
      });

      setDiarias([novaDiaria, ...diarias]);
      toast.success('Diária registrada com sucesso!');
      setShowModal(false);
      
      // Notificar mudança para o componente pai
      if (onDiariasChange) {
        onDiariasChange();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar diária');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerDetalhes = (diaria: DiariaGuardaCompleta) => {
    setDiariaSelecionada(diaria);
    setShowDetalhesModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Diárias de Guarda
          </h2>
          <p className="text-sm text-gray-600">
            Registro de diárias por maquinário
          </p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Diária
        </Button>
      </div>

      {/* Lista de Diárias */}
      <div className="space-y-3">
        {(diariasFiltradas || diarias).map((diaria) => (
          <div
            key={diaria.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {diaria.guarda_nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {diaria.empresa_nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleVerDetalhes(diaria)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            {/* Informações */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {formatDateBR(diaria.data_diaria)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCorTurno(diaria.turno)}`}>
                  {getIconeTurno(diaria.turno)} {getLabelTurno(diaria.turno)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  R$ {diaria.valor_diaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {diaria.maquinarios.length} maq.
                </span>
              </div>
            </div>

            {/* Rua e Solicitante */}
            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{diaria.rua}</span>
              </div>
              <span className="text-gray-500">por {diaria.solicitante}</span>
            </div>
          </div>
        ))}
      </div>

      {(diariasFiltradas || diarias).length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Nenhuma diária registrada</p>
          <Button onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-2" />
            Registrar Primeira Diária
          </Button>
        </div>
      )}

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nova Diária de Guarda
                  </h3>
                  <p className="text-sm text-gray-600">
                    Registre uma diária de segurança
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Guarda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarda <span className="text-red-500">*</span>
                </label>
                <select
                  value={guardaId}
                  onChange={(e) => setGuardaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecione um guarda</option>
                  {guardasAtivos.map((guarda) => (
                    <option key={guarda.id} value={guarda.id}>
                      {guarda.nome} - {guarda.empresa_nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid de 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Solicitante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solicitante <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={solicitante}
                    onChange={(e) => setSolicitante(e.target.value)}
                    placeholder="Ex: João Gerente"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Valor da Diária */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da Diária (R$) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorDiaria}
                    onChange={(e) => setValorDiaria(e.target.value)}
                    placeholder="250.00"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Diária <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dataDiaria}
                    onChange={(e) => setDataDiaria(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Turno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turno <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value as TurnoGuarda)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    disabled={isSubmitting}
                  >
                    {getTurnosDisponiveis().map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nome da Rua */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Rua <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Maquinários */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maquinários <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {mockMaquinariosDisponiveis.map((maq) => (
                    <label
                      key={maq.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={maquinariosSelecionados.includes(maq.id)}
                        onChange={() => handleToggleMaquinario(maq.id)}
                        disabled={isSubmitting}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{maq.nome}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {maquinariosSelecionados.length} selecionado(s)
                </p>
              </div>

              {/* Upload de Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto do Maquinário <span className="text-gray-500">(opcional)</span>
                </label>

                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoverFoto}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full text-sm"
                      disabled={isSubmitting}
                    />
                    <div className="mt-2 text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">JPG ou PNG até 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Observações adicionais..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || guardasAtivos.length === 0}>
                  {isSubmitting ? 'Registrando...' : 'Registrar Diária'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetalhesModal && diariaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalhes da Diária
              </h3>
              <button onClick={() => setShowDetalhesModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Guarda e Empresa */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-900 font-semibold mb-1">
                  Guarda
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {diariaSelecionada.guarda_nome}
                </div>
                <div className="text-sm text-gray-600">
                  {diariaSelecionada.empresa_nome}
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Data</div>
                  <div className="font-semibold text-gray-900">
                    {formatDateBR(diariaSelecionada.data_diaria)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Turno</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCorTurno(diariaSelecionada.turno)}`}>
                    {getIconeTurno(diariaSelecionada.turno)} {getLabelTurno(diariaSelecionada.turno)}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Valor</div>
                  <div className="font-semibold text-gray-900">
                    R$ {diariaSelecionada.valor_diaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Solicitante</div>
                  <div className="font-semibold text-gray-900">
                    {diariaSelecionada.solicitante}
                  </div>
                </div>
              </div>

              {/* Rua */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Rua</div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {diariaSelecionada.rua}
                  </span>
                </div>
              </div>

              {/* Maquinários */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Maquinários</div>
                <div className="space-y-2">
                  {diariaSelecionada.maquinarios.map((maq) => (
                    <div
                      key={maq.id}
                      className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2"
                    >
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {maq.maquinario_nome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foto */}
              {diariaSelecionada.foto_maquinario_url && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Foto do Maquinário</div>
                  <img
                    src={diariaSelecionada.foto_maquinario_url}
                    alt="Foto do maquinário"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}

              {/* Observações */}
              {diariaSelecionada.observacoes && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Observações</div>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {diariaSelecionada.observacoes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

