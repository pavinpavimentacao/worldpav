/**
 * Tab: Diárias de Guarda
 * Registro de diárias com maquinários e upload de fotos
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Calendar, MapPin, DollarSign, Clock, Truck, Upload, X, Eye, FileText, Image as ImageIcon, Camera, Edit2, Trash2 } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { toast } from '../../lib/toast-hooks';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { uploadFotoGuarda, validateImage } from '../../utils/file-upload-utils';
import {
  listarDiarias,
  listarGuardas,
  criarDiaria,
  atualizarDiaria,
  deletarDiaria,
  listarMaquinarios,
  listarObras,
  listarRuasPorObra,
} from '../../lib/guardasApi';
import {
  getLabelTurno,
  getCorTurno,
  getIconeTurno,
  getTurnosDisponiveis,
  type TurnoGuarda,
  type DiariaGuardaCompleta,
  type Guarda,
} from '../../types/guardas';
import { formatDateBR } from '../../utils/date-format';

interface DiariasGuardaTabProps {
  diariasFiltradas?: DiariaGuardaCompleta[];
  onDiariasChange?: () => void;
}

export const DiariasGuardaTab: React.FC<DiariasGuardaTabProps> = ({ 
  diariasFiltradas,
  onDiariasChange 
}) => {
  const [diarias, setDiarias] = useState<DiariaGuardaCompleta[]>([]);
  const [guardas, setGuardas] = useState<Guarda[]>([]);
  const [maquinariosDisponiveis, setMaquinariosDisponiveis] = useState<any[]>([]);
  const [obrasDisponiveis, setObrasDisponiveis] = useState<any[]>([]);
  const [ruasDisponiveis, setRuasDisponiveis] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [diariaSelecionada, setDiariaSelecionada] = useState<DiariaGuardaCompleta | null>(null);
  const [diariaParaExcluir, setDiariaParaExcluir] = useState<DiariaGuardaCompleta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [diariaEditandoId, setDiariaEditandoId] = useState<string | null>(null);
  const [isDeletando, setIsDeletando] = useState(false);

  // Form fields
  const [guardaId, setGuardaId] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [dataDiaria, setDataDiaria] = useState(new Date().toISOString().split('T')[0]);
  const [turno, setTurno] = useState<TurnoGuarda>('noite');
  const [obraId, setObraId] = useState('');
  const [ruaId, setRuaId] = useState('');
  const [ruaNome, setRuaNome] = useState('');
  const [maquinariosSelecionados, setMaquinariosSelecionados] = useState<string[]>([]);
  const [fotoMaquinario, setFotoMaquinario] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados ao montar
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [diariasData, guardasData, maquinariosData, obrasData] = await Promise.all([
        listarDiarias(),
        listarGuardas(),
        listarMaquinarios(),
        listarObras(),
      ]);
      setDiarias(diariasData);
      setGuardas(guardasData);
      setMaquinariosDisponiveis(maquinariosData);
      setObrasDisponiveis(obrasData);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const guardasAtivos = guardas.filter((g) => !g.deleted_at);

  const handleOpenModal = () => {
    limparFormulario();
    setIsEditMode(false);
    setDiariaEditandoId(null);
    setShowModal(true);
  };

  const limparFormulario = () => {
    setGuardaId(guardasAtivos[0]?.id || '');
    setSolicitante('');
    setValorDiaria('');
    setDataDiaria(new Date().toISOString().split('T')[0]);
    setTurno('noite');
    setObraId('');
    setRuaId('');
    setRuaNome('');
    setRuasDisponiveis([]);
    setMaquinariosSelecionados([]);
    setFotoMaquinario(null);
    setPreviewUrl(null);
    setObservacoes('');
  };

  const handleEditarDiaria = async (diaria: DiariaGuardaCompleta) => {
    setIsEditMode(true);
    setDiariaEditandoId(diaria.id);
    
    // Preencher form com dados da diária
    setGuardaId(diaria.guarda_id);
    setSolicitante(diaria.solicitante);
    setValorDiaria(diaria.valor_diaria.toString());
    setDataDiaria(diaria.data_diaria);
    setTurno(diaria.turno);
    setObraId(diaria.obra_id || '');
    setRuaId(diaria.rua_id || '');
    setRuaNome(diaria.rua_nome || '');
    setObservacoes(diaria.observacoes || '');
    
    // Carregar ruas se houver obra
    if (diaria.obra_id) {
      try {
        const ruas = await listarRuasPorObra(diaria.obra_id);
        setRuasDisponiveis(ruas);
      } catch (error) {
        console.error('Erro ao carregar ruas:', error);
      }
    }
    
    // Maquinários selecionados
    const maquinariosIds = diaria.maquinarios.map(m => m.maquinario_id);
    setMaquinariosSelecionados(maquinariosIds);
    
    // Preview da foto existente
    if (diaria.foto_maquinario_url) {
      setPreviewUrl(diaria.foto_maquinario_url);
    }
    
    setShowModal(true);
  };

  const handleDeletarDiaria = (diaria: DiariaGuardaCompleta) => {
    setDiariaParaExcluir(diaria);
    setShowConfirmDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (!diariaParaExcluir) return;

    setIsDeletando(true);
    try {
      await deletarDiaria(diariaParaExcluir.id);
      toast.success('Diária excluída com sucesso!');
      
      // Fechar modal
      setShowConfirmDeleteModal(false);
      setDiariaParaExcluir(null);
      
      // Atualizar lista local
      setDiarias(diarias.filter(d => d.id !== diariaParaExcluir.id));
      
      // Notificar mudança para o componente pai para atualizar diariasFiltradas
      if (onDiariasChange) {
        onDiariasChange();
      }
      
      // Recarregar dados para garantir sincronização
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao excluir diária:', error);
      toast.error(error.message || 'Erro ao excluir diária');
    } finally {
      setIsDeletando(false);
    }
  };

  const cancelarExclusao = () => {
    setShowConfirmDeleteModal(false);
    setDiariaParaExcluir(null);
  };

  // Carregar ruas quando obra é selecionada
  const handleObraChange = async (novaObraId: string) => {
    setObraId(novaObraId);
    setRuaId('');
    setRuasDisponiveis([]);
    
    if (novaObraId) {
      try {
        const ruas = await listarRuasPorObra(novaObraId);
        setRuasDisponiveis(ruas);
      } catch (error) {
        console.error('Erro ao carregar ruas:', error);
        toast.error('Erro ao carregar ruas da obra');
      }
    }
  };

  const handleToggleMaquinario = (maquinarioId: string) => {
    setMaquinariosSelecionados((prev) =>
      prev.includes(maquinarioId)
        ? prev.filter((id) => id !== maquinarioId)
        : [...prev, maquinarioId]
    );
  };

  // Função para processar arquivo selecionado
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;

    // Validar arquivo
    const validation = validateImage(file);
    if (!validation.valido) {
      toast.error(validation.mensagem || 'Imagem inválida');
      return;
    }

    setFotoMaquinario(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handler para input file
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handler para drag & drop
  const handleDropFiles = useCallback((files: FileList | File[]) => {
    const file = files[0] as File;
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Hook de drag & drop
  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: handleDropFiles,
    disabled: isSubmitting || isUploadingFoto,
    multiple: false
  });

  const handleRemoverFoto = () => {
    setFotoMaquinario(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUploadArea = () => {
    if (!isSubmitting && !isUploadingFoto) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validações
    if (!guardaId || !solicitante.trim() || !valorDiaria) {
      toast.error('Preencha todos os campos obrigatórios');
      setIsSubmitting(false);
      return;
    }

    // Validar obra/rua: se escolheu obra, precisa escolher rua (ou preencher manualmente)
    if (obraId && !ruaId && !ruaNome.trim()) {
      toast.error('Selecione uma rua ou digite o nome');
      setIsSubmitting(false);
      return;
    }

    // Se não escolheu obra, precisa digitar a rua manualmente
    if (!obraId && !ruaNome.trim()) {
      toast.error('Digite o nome da rua');
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
      // Upload da foto (se houver NOVA foto)
      let fotoUrl: string | undefined;
      if (fotoMaquinario) {
        setIsUploadingFoto(true);
        toast.info('Fazendo upload da foto...');
        
        const tempId = isEditMode ? diariaEditandoId! : `temp_${Date.now()}`;
        const uploadResult = await uploadFotoGuarda(fotoMaquinario, tempId);
        
        setIsUploadingFoto(false);
        
        if (uploadResult.error) {
          toast.error(`Erro ao fazer upload da foto: ${uploadResult.error}`);
          setIsSubmitting(false);
          return;
        }
        
        fotoUrl = uploadResult.url || undefined;
        console.log('✅ Foto carregada:', fotoUrl);
      } else if (previewUrl && !fotoMaquinario) {
        // Manter foto existente se estiver editando e não adicionou nova
        fotoUrl = previewUrl;
      }

      if (isEditMode && diariaEditandoId) {
        // EDITAR DIÁRIA
        await atualizarDiaria(diariaEditandoId, {
          solicitante: solicitante.trim(),
          valor_diaria: valorNum,
          data_diaria: dataDiaria,
          turno,
          obra_id: obraId || null,
          rua_id: ruaId || null,
          rua_nome: ruaNome.trim() || '',
          maquinarios_ids: maquinariosSelecionados,
          foto_maquinario_url: fotoUrl,
          observacoes: observacoes.trim() || '',
        });

        toast.success('Diária atualizada com sucesso!');
        
        // Recarregar dados para garantir sincronização
        await carregarDados();
      } else {
        // CRIAR NOVA DIÁRIA
        await criarDiaria({
          guarda_id: guardaId,
          solicitante: solicitante.trim(),
          valor_diaria: valorNum,
          data_diaria: dataDiaria,
          turno,
          obra_id: obraId || undefined,
          rua_id: ruaId || undefined,
          rua_nome: ruaNome.trim() || undefined,
          maquinarios_ids: maquinariosSelecionados,
          foto_maquinario_url: fotoUrl,
          observacoes: observacoes.trim() || undefined,
        });

        toast.success('Diária registrada com sucesso!');
        
        // Recarregar dados para garantir sincronização
        await carregarDados();
      }

      setShowModal(false);
      
      // Notificar mudança para o componente pai
      if (onDiariasChange) {
        onDiariasChange();
      }
    } catch (error: any) {
      console.error('Erro ao salvar diária:', error);
      toast.error(error.message || 'Erro ao salvar diária');
    } finally {
      setIsSubmitting(false);
      setIsUploadingFoto(false);
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

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-3">Carregando diárias...</p>
        </div>
      )}

      {/* Lista de Diárias */}
      {!isLoading && (
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
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEditarDiaria(diaria)}
                  className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  title="Editar diária"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletarDiaria(diaria)}
                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Excluir diária"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleVerDetalhes(diaria)}
                  className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Ver detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
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
                  R$ {(diaria.valor_diaria || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {diaria.maquinarios.length} maq.
                </span>
              </div>
            </div>

            {/* Obra e Rua */}
            {diaria.obra_nome && (
              <div className="text-sm bg-blue-50 rounded-lg p-2 mb-2">
                <span className="text-blue-900 font-medium">Obra:</span>{' '}
                <span className="text-blue-700">{diaria.obra_nome}</span>
              </div>
            )}

            {/* Rua e Solicitante */}
            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{diaria.rua_nome || 'Sem rua especificada'}</span>
              </div>
              <span className="text-gray-500">por {diaria.solicitante}</span>
            </div>
          </div>
        ))}
        </div>
      )}

      {!isLoading && (diariasFiltradas || diarias).length === 0 && (
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
                    {isEditMode ? 'Editar Diária de Guarda' : 'Nova Diária de Guarda'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEditMode ? 'Atualizar informações da diária' : 'Registre uma diária de segurança'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting || isUploadingFoto}
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
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required
                  disabled={isSubmitting || isEditMode}
                  title={isEditMode ? 'Não é possível alterar o guarda de uma diária existente' : ''}
                >
                  <option value="">Selecione um guarda</option>
                  {guardasAtivos.map((guarda) => (
                    <option key={guarda.id} value={guarda.id}>
                      {guarda.nome} - {guarda.empresa_nome}
                    </option>
                  ))}
                </select>
                {isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    O guarda não pode ser alterado em uma diária existente
                  </p>
                )}
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

              {/* Obra (Opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obra <span className="text-gray-500">(opcional)</span>
                </label>
                <select
                  value={obraId}
                  onChange={(e) => handleObraChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={isSubmitting}
                >
                  <option value="">Nenhuma obra específica</option>
                  {obrasDisponiveis.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rua - Select ou Manual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua <span className="text-red-500">*</span>
                </label>
                
                {obraId && ruasDisponiveis.length > 0 ? (
                  <select
                    value={ruaId}
                    onChange={(e) => setRuaId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione uma rua</option>
                    {ruasDisponiveis.map((rua) => (
                      <option key={rua.id} value={rua.id}>
                        {rua.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type="text"
                    value={ruaNome}
                    onChange={(e) => setRuaNome(e.target.value)}
                    placeholder="Ex: Rua das Flores, 123"
                    required
                    disabled={isSubmitting}
                  />
                )}
                {obraId && ruasDisponiveis.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Nenhuma rua cadastrada nesta obra. Digite manualmente.
                  </p>
                )}
              </div>

              {/* Maquinários Reais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maquinários <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {maquinariosDisponiveis.map((maq) => (
                    <label
                      key={maq.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={maquinariosSelecionados.includes(maq.id)}
                        onChange={() => handleToggleMaquinario(maq.id)}
                        disabled={isSubmitting}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{maq.name}</div>
                        <div className="text-xs text-gray-600">
                          {maq.type} {maq.plate && `• Placa: ${maq.plate}`}
                        </div>
                      </div>
                    </label>
                  ))}
                  {maquinariosDisponiveis.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum maquinário disponível
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {maquinariosSelecionados.length} selecionado(s)
                </p>
              </div>

              {/* Upload de Foto com Drag & Drop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto do Maquinário <span className="text-gray-500">(opcional)</span>
                </label>

                {previewUrl ? (
                  // Preview da Foto
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoverFoto}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      disabled={isSubmitting || isUploadingFoto}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      Clique no X para alterar a foto
                    </div>
                  </div>
                ) : (
                  // Área de Upload com Drag & Drop
                  <div
                    className={`
                      relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                      ${isDragging 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                      }
                      ${(isSubmitting || isUploadingFoto) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    {...dragHandlers}
                    onClick={handleClickUploadArea}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                      disabled={isSubmitting || isUploadingFoto}
                    />

                    <div className="space-y-3">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                        isDragging ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Camera className={`w-8 h-8 ${
                          isDragging ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 font-medium">
                          <Upload className="w-4 h-4" />
                          <span>
                            {isDragging 
                              ? 'Solte a imagem aqui' 
                              : 'Arraste uma foto ou clique para selecionar'
                            }
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG ou WebP até 5MB
                        </p>
                      </div>
                    </div>

                    {isUploadingFoto && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Enviando foto...</p>
                        </div>
                      </div>
                    )}
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
                  disabled={isSubmitting || isUploadingFoto}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isUploadingFoto || (!isEditMode && guardasAtivos.length === 0)}
                >
                  {isUploadingFoto 
                    ? 'Enviando foto...' 
                    : isSubmitting 
                      ? (isEditMode ? 'Atualizando...' : 'Registrando...')
                      : (isEditMode ? 'Atualizar Diária' : 'Registrar Diária')
                  }
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
                    R$ {(diariaSelecionada.valor_diaria || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Solicitante</div>
                  <div className="font-semibold text-gray-900">
                    {diariaSelecionada.solicitante}
                  </div>
                </div>
              </div>

              {/* Obra */}
              {diariaSelecionada.obra_nome && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Obra</div>
                  <div className="font-semibold text-blue-900 bg-blue-50 rounded-lg p-2">
                    {diariaSelecionada.obra_nome}
                  </div>
                </div>
              )}

              {/* Rua */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Rua</div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {diariaSelecionada.rua_nome || 'Sem rua especificada'}
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
                      className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3"
                    >
                      <Truck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {maq.maquinario_nome}
                        </div>
                        {maq.maquinario_tipo && (
                          <div className="text-xs text-gray-600">
                            {maq.maquinario_tipo}
                            {maq.maquinario_placa && ` • Placa: ${maq.maquinario_placa}`}
                          </div>
                        )}
                      </div>
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

      {/* Modal de Confirmação de Exclusão */}
      {showConfirmDeleteModal && diariaParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 rounded-lg p-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </h3>
              </div>
              <button
                onClick={cancelarExclusao}
                disabled={isDeletando}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Tem certeza que deseja excluir esta diária?
              </p>

              {/* Informações da Diária */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Guarda:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {diariaParaExcluir.guarda_nome}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Data:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDateBR(diariaParaExcluir.data_diaria)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Turno:</span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${getCorTurno(diariaParaExcluir.turno)}`}>
                    {getIconeTurno(diariaParaExcluir.turno)} {getLabelTurno(diariaParaExcluir.turno)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Valor:</span>
                  <span className="text-sm font-semibold text-green-600">
                    R$ {(diariaParaExcluir.valor_diaria || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {diariaParaExcluir.rua_nome && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Rua:</span>
                    <span className="text-sm text-gray-900">
                      {diariaParaExcluir.rua_nome}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Atenção:</strong> Esta ação não pode ser desfeita. A diária será permanentemente excluída do sistema.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={cancelarExclusao}
                disabled={isDeletando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmarExclusao}
                disabled={isDeletando}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeletando ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sim, Excluir Diária
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

