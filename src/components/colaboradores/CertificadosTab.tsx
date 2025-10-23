import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Award, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ColaboradorCertificado,
  ColaboradorCertificadoInsert,
} from '../../types/colaboradores';
import { supabase } from '../../lib/supabase';
import { uploadDocumento } from '../../services/colaborador-storage';
import { toast } from '../../lib/toast-hooks';

interface CertificadosTabProps {
  colaboradorId: string;
}

export const CertificadosTab: React.FC<CertificadosTabProps> = ({
  colaboradorId,
}) => {
  const [certificados, setCertificados] = useState<ColaboradorCertificado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<ColaboradorCertificado | null>(null);

  // Form state
  const [nomeCurso, setNomeCurso] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const carregarCertificados = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('colaboradores_certificados')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificados(data || []);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      toast.error('Erro ao carregar certificados');
    } finally {
      setIsLoading(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    carregarCertificados();
  }, [carregarCertificados]);

  const abrirModal = (certificado?: ColaboradorCertificado) => {
    if (certificado) {
      setEditando(certificado);
      setNomeCurso(certificado.nome_curso);
      setInstituicao(certificado.instituicao || '');
      setDataEmissao(certificado.data_emissao || '');
      setDataValidade(certificado.data_validade || '');
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditando(null);
    setNomeCurso('');
    setInstituicao('');
    setDataEmissao('');
    setDataValidade('');
    setArquivo(null);
  };

  const handleSalvar = async () => {
    if (!nomeCurso.trim()) {
      toast.error('Nome do curso é obrigatório');
      return;
    }

    try {
      setUploading(true);

      let arquivoUrl = editando?.arquivo_url || null;

      // Upload do arquivo se selecionado
      if (arquivo) {
        const uploadResult = await uploadDocumento(
          arquivo,
          colaboradorId,
          'certificados'
        );
        if (uploadResult) {
          arquivoUrl = uploadResult.url;
        }
      }

      if (editando) {
        // Atualizar
        const { error } = await supabase
          .from('colaboradores_certificados')
          .update({
            nome_curso: nomeCurso,
            instituicao: instituicao || null,
            data_emissao: dataEmissao || null,
            data_validade: dataValidade || null,
            arquivo_url: arquivoUrl,
          })
          .eq('id', editando.id);

        if (error) throw error;
        toast.success('Certificado atualizado!');
      } else {
        // Inserir
        const novoCertificado: ColaboradorCertificadoInsert = {
          colaborador_id: colaboradorId,
          nome_curso: nomeCurso,
          instituicao: instituicao || null,
          data_emissao: dataEmissao || null,
          data_validade: dataValidade || null,
          arquivo_url: arquivoUrl,
        };

        const { error } = await supabase
          .from('colaboradores_certificados')
          .insert(novoCertificado);

        if (error) throw error;
        toast.success('Certificado adicionado!');
      }

      setShowModal(false);
      resetForm();
      await carregarCertificados();
    } catch (error: unknown) {
      console.error('Erro ao salvar certificado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar certificado';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Deseja realmente excluir este certificado?')) return;

    try {
      const { error } = await supabase
        .from('colaboradores_certificados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Certificado excluído!');
      await carregarCertificados();
    } catch (error: unknown) {
      console.error('Erro ao excluir certificado:', error);
      toast.error('Erro ao excluir certificado');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Carregando certificados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Award className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Certificados e Cursos
          </h3>
        </div>
        <Button onClick={() => abrirModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Certificado
        </Button>
      </div>

      {/* Lista */}
      {certificados.length === 0 ? (
        <div className="card p-12 text-center">
          <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Nenhum certificado cadastrado</p>
          <Button onClick={() => abrirModal()} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Certificado
          </Button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Curso/Certificação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Instituição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Emissão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificados.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                        <div className="text-sm font-medium text-gray-900">
                          {cert.nome_curso}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cert.instituicao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cert.data_emissao
                        ? format(new Date(cert.data_emissao), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cert.data_validade
                        ? format(new Date(cert.data_validade), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        {cert.arquivo_url && (
                          <button
                            onClick={() => window.open(cert.arquivo_url!, '_blank')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => abrirModal(cert)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExcluir(cert.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editando ? 'Editar Certificado' : 'Novo Certificado'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Curso/Certificação <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={nomeCurso}
                  onChange={(e) => setNomeCurso(e.target.value)}
                  placeholder="Ex: NR-35 - Trabalho em Altura"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instituição
                </label>
                <Input
                  type="text"
                  value={instituicao}
                  onChange={(e) => setInstituicao(e.target.value)}
                  placeholder="Ex: SENAI"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Emissão
                  </label>
                  <Input
                    type="date"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Validade
                  </label>
                  <Input
                    type="date"
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo do Certificado
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={uploading}>
                {uploading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




