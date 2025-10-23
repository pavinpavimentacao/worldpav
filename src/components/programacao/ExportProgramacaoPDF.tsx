import React, { useState } from 'react';
import { Button } from "../shared/Button";
import { FileDown, Calendar, X } from 'lucide-react';
import type { ProgramacaoPavimentacao } from '../../types/programacao-pavimentacao';
import { formatDateBR } from '../../utils/date-format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface ExportProgramacaoPDFProps {
  programacoes: ProgramacaoPavimentacao[];
}

export function ExportProgramacaoPDF({ programacoes }: ExportProgramacaoPDFProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Obter datas únicas das programações
  const datasDisponiveis = Array.from(new Set(programacoes.map(p => p.data))).sort();

  const handleExportPDF = () => {
    try {
      if (!selectedDate) {
        alert('Selecione uma data para exportar');
        return;
      }

      // Filtrar programações pela data selecionada
      const programacoesDoDia = programacoes.filter(p => p.data === selectedDate);

      if (programacoesDoDia.length === 0) {
        alert('Não há programações para esta data');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Configurar fonte
      doc.setFont('helvetica');

      // Adicionar título
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235); // Blue
      doc.text('PROGRAMAÇÃO DE PAVIMENTAÇÃO', 148, 15, { align: 'center' });

      // Adicionar data selecionada
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138); // Dark blue
      doc.text(`Data: ${formatDateBR(selectedDate)}`, 148, 23, { align: 'center' });

      // Adicionar data de geração
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 148, 29, { align: 'center' });

      let currentY = 35;
      const progs = programacoesDoDia;

      // Cabeçalho
      doc.setFillColor(37, 99, 235); // Blue
      doc.rect(10, currentY, 277, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${progs.length} programação(ões)`, 12, currentY + 5.5);
      
      currentY += 10;

      // Preparar dados da tabela
      const tableData = progs.map((prog) => {
        // Pegar espessura (novo campo ou campo antigo)
        const espessura = prog.espessura_media_solicitada || prog.espessura || '-';
        const espessuraFormatada = espessura !== '-' 
          ? (espessura.toString().includes('cm') ? espessura : `${espessura} cm`)
          : '-';

        return [
          prog.cliente_nome || '-',
          prog.obra || '-',
          prog.rua || '-',
          prog.prefixo_equipe || '-',
          prog.maquinarios_nomes ? prog.maquinarios_nomes.join(', ') : '-',
          `${prog.metragem_prevista.toLocaleString('pt-BR')} m²`,
          `${prog.quantidade_toneladas.toLocaleString('pt-BR')} ton`,
          prog.faixa_realizar || '-',
          espessuraFormatada,
        ];
      });

      // Criar tabela
      autoTable(doc, {
        startY: currentY,
        head: [
          [
            'Cliente',
            'Obra',
            'Rua',
            'Equipe',
            'Maquinários',
            'Metragem',
            'Toneladas',
            'Faixa',
            'Espessura',
          ],
        ],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246], // Blue
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [50, 50, 50],
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Cliente
          1: { cellWidth: 35 }, // Obra
          2: { cellWidth: 30 }, // Rua
          3: { cellWidth: 22 }, // Equipe
          4: { cellWidth: 50 }, // Maquinários
          5: { cellWidth: 22 }, // Metragem
          6: { cellWidth: 22 }, // Toneladas
          7: { cellWidth: 30 }, // Faixa
          8: { cellWidth: 20 }, // Espessura
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        margin: { left: 10, right: 10 },
      });

      // @ts-ignore - autoTable adiciona lastAutoTable
      currentY = (doc as any).lastAutoTable.finalY + 5;

      // Adicionar observações se houver
      progs.forEach((prog, idx) => {
        if (prog.observacoes) {
          // Verificar se precisa de nova página
          if (currentY > 185) {
            doc.addPage();
            currentY = 15;
          }

          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 100);
          doc.text(`Obs. ${idx + 1}:`, 12, currentY);
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          const splitObs = doc.splitTextToSize(prog.observacoes, 265);
          doc.text(splitObs, 12, currentY + 4);
          
          currentY += 4 + (splitObs.length * 3.5) + 2;
        }
      });

      // Adicionar rodapé em todas as páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount} | WorldPav - Sistema de Gestão de Pavimentação`,
          148,
          202,
          { align: 'center' }
        );
      }

      // Salvar PDF
      doc.save(`programacao_${formatDateBR(selectedDate).replace(/\//g, '-')}.pdf`);
      
      // Fechar modal
      setIsModalOpen(false);
      setSelectedDate('');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        disabled={programacoes.length === 0}
        className="gap-2 border-red-600 text-red-600 hover:bg-red-50"
      >
        <FileDown className="h-4 w-4" />
        Exportar Dia
      </Button>

      {/* Modal de Seleção de Data */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            {/* Header do Modal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Exportar Dia</h2>
                  <p className="text-sm text-gray-500">Selecione a data para exportar</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedDate('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Lista de Datas Disponíveis */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datas com Programações
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {datasDisponiveis.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma data disponível
                  </p>
                ) : (
                  datasDisponiveis.map((data) => {
                    const qtdProgramacoes = programacoes.filter(p => p.data === data).length;
                    return (
                      <button
                        key={data}
                        onClick={() => setSelectedDate(data)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedDate === data
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatDateBR(data)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {qtdProgramacoes} {qtdProgramacoes === 1 ? 'programação' : 'programações'}
                            </p>
                          </div>
                          {selectedDate === data && (
                            <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedDate('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={!selectedDate}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

