import React from 'react';
import { Button } from "../shared/Button";
import { Download, FileSpreadsheet } from 'lucide-react';
import type { ProgramacaoPavimentacao, ProgramacaoPavimentacaoExport } from '../../types/programacao-pavimentacao';
import { formatDateBR } from '../../utils/date-format';
import * as XLSX from 'xlsx';

interface ExportProgramacaoProps {
  programacoes: ProgramacaoPavimentacao[];
  fileName?: string;
}

export const ExportProgramacao: React.FC<ExportProgramacaoProps> = ({
  programacoes,
  fileName = 'programacao-pavimentacao',
}) => {
  const exportToExcel = () => {
    if (programacoes.length === 0) {
      alert('Nenhuma programação para exportar');
      return;
    }

    // Converter dados para formato de exportação
    const dadosExport: ProgramacaoPavimentacaoExport[] = programacoes.map((prog) => ({
      'Data': formatDateBR(prog.data),
      'Cliente': prog.cliente_nome || '-',
      'Obra': prog.obra,
      'Rua': prog.rua,
      'Prefixo da Equipe': prog.prefixo_equipe,
      'Maquinários': prog.maquinarios_nomes?.join(', ') || '-',
      'Metragem Prevista (m²)': prog.metragem_prevista.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      'Quantidade de Toneladas': prog.quantidade_toneladas.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      'Faixa a Ser Realizada': prog.faixa_realizar,
      ...(prog.espessura_media_solicitada && { 'Espessura Média Solicitada': prog.espessura_media_solicitada }),
      ...(prog.horario_inicio && { 'Horário Início': prog.horario_inicio }),
      ...(prog.tipo_servico && { 'Tipo de Serviço': prog.tipo_servico }),
      ...(prog.espessura && { 'Espessura (cm)': prog.espessura }),
      ...(prog.observacoes && { 'Observações': prog.observacoes }),
    }));

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(dadosExport);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 12 }, // Data
      { wch: 30 }, // Cliente
      { wch: 35 }, // Obra
      { wch: 40 }, // Rua
      { wch: 18 }, // Prefixo da Equipe
      { wch: 50 }, // Maquinários
      { wch: 20 }, // Metragem Prevista
      { wch: 22 }, // Quantidade de Toneladas
      { wch: 25 }, // Faixa a Ser Realizada
      { wch: 22 }, // Espessura Média Solicitada
      { wch: 15 }, // Horário Início
      { wch: 25 }, // Tipo de Serviço
      { wch: 15 }, // Espessura
      { wch: 50 }, // Observações
    ];
    ws['!cols'] = colWidths;

    // Criar workbook e adicionar worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Programação');

    // Gerar nome do arquivo com data
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const finalFileName = `${fileName}_${dateStr}.xlsx`;

    // Download
    XLSX.writeFile(wb, finalFileName);
  };

  const exportToPDF = () => {
    alert('Exportação para PDF será implementada em breve!');
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToExcel} variant="outline">
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Exportar Excel
      </Button>
      <Button onClick={exportToPDF} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Exportar PDF
      </Button>
    </div>
  );
};

