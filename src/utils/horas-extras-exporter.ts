import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface HoraExtraExportData {
  id: string;
  colaborador: string;
  data: string;
  horario_entrada?: string | null;
  horario_saida?: string | null;
  tipo_dia: string;
  horas: number;
  valor_calculado: number;
  created_at: string;
}

export interface HorasExtrasExportOptions {
  periodo?: {
    dataInicio: string;
    dataFim: string;
  };
  filtros?: {
    nome?: string;
    equipe?: string;
  };
}

export class HorasExtrasExporter {
  /**
   * Exporta horas extras para Excel
   */
  static exportToExcel(
    data: HoraExtraExportData[],
    options: HorasExtrasExportOptions = {}
  ): void {
    try {
      console.log('🚀 Iniciando exportação Excel de horas extras...');

      if (!data || data.length === 0) {
        throw new Error('Nenhuma hora extra encontrada para exportar');
      }

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Preparar dados para a planilha principal
      const dadosPlanilha = data.map((item) => ({
        'Colaborador': item.colaborador,
        'Data': this.formatarDataBR(item.data),
        'Entrada': item.horario_entrada || '-',
        'Saída': item.horario_saida || '-',
        'Tipo de Dia': this.formatarTipoDia(item.tipo_dia),
        'Horas Extras': item.horas,
        'Valor (R$)': item.valor_calculado,
        'Registrado em': this.formatarDataHoraBR(item.created_at),
      }));

      // Criar worksheet principal
      const ws = XLSX.utils.json_to_sheet(dadosPlanilha);

      // Ajustar largura das colunas
      ws['!cols'] = [
        { wch: 30 }, // Colaborador
        { wch: 12 }, // Data
        { wch: 10 }, // Entrada
        { wch: 10 }, // Saída
        { wch: 15 }, // Tipo de Dia
        { wch: 12 }, // Horas Extras
        { wch: 15 }, // Valor
        { wch: 20 }, // Registrado em
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Horas Extras');

      // Criar planilha de resumo
      const resumo = this.calcularResumo(data);
      const resumoData = [
        ['Resumo de Horas Extras'],
        [],
        ['Total de Registros', resumo.totalRegistros],
        ['Total de Horas', `${resumo.totalHoras.toFixed(1)}h`],
        ['Valor Total', `R$ ${resumo.valorTotal.toFixed(2)}`],
        [],
        ['Por Tipo de Dia'],
        ...resumo.porTipoDia.map(item => [item.tipo, `${item.horas.toFixed(1)}h`, `R$ ${item.valor.toFixed(2)}`]),
        [],
        ['Por Colaborador'],
        ...resumo.porColaborador.map(item => [item.colaborador, `${item.horas.toFixed(1)}h`, `R$ ${item.valor.toFixed(2)}`]),
      ];

      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      wsResumo['!cols'] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

      // Gerar nome do arquivo
      const fileName = this.generateFileName('xlsx', options);
      console.log('📁 Nome do arquivo:', fileName);

      // Salvar arquivo
      XLSX.writeFile(wb, fileName);
      console.log('✅ Excel exportado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao exportar para Excel:', error);
      throw new Error(`Erro ao exportar para Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Exporta horas extras para PDF profissional
   */
  static exportToPDF(
    data: HoraExtraExportData[],
    options: HorasExtrasExportOptions = {}
  ): void {
    try {
      console.log('🚀 Iniciando exportação PDF de horas extras...');

      if (!data || data.length === 0) {
        throw new Error('Nenhuma hora extra encontrada para exportar');
      }

      // Criar PDF no formato A4 paisagem para mais espaço
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Adicionar cabeçalho
      yPosition = this.addPDFHeader(pdf, options, yPosition);

      // Adicionar resumo
      const resumo = this.calcularResumo(data);
      yPosition = this.addPDFResumo(pdf, resumo, yPosition, pageWidth);

      // Adicionar tabela de horas extras
      this.addPDFTable(pdf, data, yPosition, pageWidth, pageHeight);

      // Adicionar rodapé
      this.addPDFFooter(pdf, pageWidth, pageHeight);

      // Gerar nome do arquivo
      const fileName = this.generateFileName('pdf', options);
      console.log('📁 Nome do arquivo:', fileName);

      // Salvar arquivo
      pdf.save(fileName);
      console.log('✅ PDF exportado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao exportar para PDF:', error);
      throw new Error(`Erro ao exportar para PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Adiciona cabeçalho ao PDF
   */
  private static addPDFHeader(
    pdf: jsPDF,
    options: HorasExtrasExportOptions,
    yPosition: number
  ): number {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Título
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório de Horas Extras', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Informações do período
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    if (options.periodo) {
      pdf.text(
        `Período: ${this.formatarDataBR(options.periodo.dataInicio)} até ${this.formatarDataBR(options.periodo.dataFim)}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
      );
      yPosition += 5;
    }

    // Data de geração
    const dataGeracao = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    pdf.text(`Gerado em: ${dataGeracao}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;

    return yPosition;
  }

  /**
   * Adiciona resumo ao PDF
   */
  private static addPDFResumo(
    pdf: jsPDF,
    resumo: any,
    yPosition: number,
    pageWidth: number
  ): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumo', 15, yPosition);

    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const resumoData = [
      ['Total de Registros', resumo.totalRegistros.toString()],
      ['Total de Horas', `${resumo.totalHoras.toFixed(1)}h`],
      ['Valor Total', `R$ ${resumo.valorTotal.toFixed(2)}`],
    ];

    try {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Item', 'Valor']],
        body: resumoData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'right' },
        },
        margin: { left: 15, right: 15 },
      });

      return (pdf as any).lastAutoTable?.finalY ? (pdf as any).lastAutoTable.finalY + 10 : yPosition + 30;
    } catch (error) {
      console.error('Erro ao adicionar tabela de resumo:', error);
      // Fallback: adicionar texto simples
      pdf.setFontSize(10);
      resumoData.forEach((row, index) => {
        pdf.text(row[0], 15, yPosition + (index * 7));
        pdf.text(row[1], 100, yPosition + (index * 7));
      });
      return yPosition + (resumoData.length * 7) + 5;
    }
  }

  /**
   * Adiciona tabela de horas extras ao PDF
   */
  private static addPDFTable(
    pdf: jsPDF,
    data: HoraExtraExportData[],
    yPosition: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    // Preparar dados da tabela
    const tableData = data.map((item) => [
      item.colaborador,
      this.formatarDataBR(item.data),
      item.horario_entrada || '-',
      item.horario_saida || '-',
      this.formatarTipoDia(item.tipo_dia),
      `${item.horas.toFixed(1)}h`,
      `R$ ${item.valor_calculado.toFixed(2)}`,
    ]);

    try {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Colaborador', 'Data', 'Entrada', 'Saída', 'Tipo', 'Horas', 'Valor']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 25, halign: 'right' },
        },
        margin: { left: 15, right: 15 },
        pageBreak: 'auto',
        showHead: 'everyPage',
      });
    } catch (error) {
      console.error('Erro ao adicionar tabela principal:', error);
      // Fallback: adicionar dados como texto
      pdf.setFontSize(8);
      let currentY = yPosition;
      // Adicionar cabeçalho manualmente
      const headers = ['Colaborador', 'Data', 'Entrada', 'Saída', 'Tipo', 'Horas', 'Valor'];
      pdf.setFont('helvetica', 'bold');
      headers.forEach((header, colIndex) => {
        const xPositions = [15, 55, 80, 100, 120, 145, 165];
        pdf.text(header, xPositions[colIndex] || 15, currentY);
      });
      currentY += 5;
      pdf.setFont('helvetica', 'normal');
      tableData.forEach((row, index) => {
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = 20;
          // Re-adicionar cabeçalho
          pdf.setFont('helvetica', 'bold');
          headers.forEach((header, colIndex) => {
            const xPositions = [15, 55, 80, 100, 120, 145, 165];
            pdf.text(header, xPositions[colIndex] || 15, currentY);
          });
          currentY += 5;
          pdf.setFont('helvetica', 'normal');
        }
        row.forEach((cell, colIndex) => {
          const xPositions = [15, 55, 80, 100, 120, 145, 165];
          pdf.text(String(cell), xPositions[colIndex] || 15, currentY);
        });
        currentY += 7;
      });
    }
  }

  /**
   * Adiciona rodapé ao PDF
   */
  private static addPDFFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    const totalPages = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  /**
   * Calcula resumo das horas extras
   */
  private static calcularResumo(data: HoraExtraExportData[]) {
    const totalRegistros = data.length;
    const totalHoras = data.reduce((sum, item) => sum + item.horas, 0);
    const valorTotal = data.reduce((sum, item) => sum + item.valor_calculado, 0);

    // Agrupar por tipo de dia
    const porTipoDiaMap = new Map<string, { horas: number; valor: number }>();
    data.forEach((item) => {
      const tipo = this.formatarTipoDia(item.tipo_dia);
      const atual = porTipoDiaMap.get(tipo) || { horas: 0, valor: 0 };
      porTipoDiaMap.set(tipo, {
        horas: atual.horas + item.horas,
        valor: atual.valor + item.valor_calculado,
      });
    });

    const porTipoDia = Array.from(porTipoDiaMap.entries()).map(([tipo, dados]) => ({
      tipo,
      horas: dados.horas,
      valor: dados.valor,
    }));

    // Agrupar por colaborador
    const porColaboradorMap = new Map<string, { horas: number; valor: number }>();
    data.forEach((item) => {
      const atual = porColaboradorMap.get(item.colaborador) || { horas: 0, valor: 0 };
      porColaboradorMap.set(item.colaborador, {
        horas: atual.horas + item.horas,
        valor: atual.valor + item.valor_calculado,
      });
    });

    const porColaborador = Array.from(porColaboradorMap.entries())
      .map(([colaborador, dados]) => ({
        colaborador,
        horas: dados.horas,
        valor: dados.valor,
      }))
      .sort((a, b) => b.horas - a.horas);

    return {
      totalRegistros,
      totalHoras,
      valorTotal,
      porTipoDia,
      porColaborador,
    };
  }

  /**
   * Formata data para formato brasileiro
   */
  private static formatarDataBR(data: string): string {
    try {
      return format(new Date(data + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return data;
    }
  }

  /**
   * Formata data e hora para formato brasileiro
   */
  private static formatarDataHoraBR(data: string): string {
    try {
      return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return data;
    }
  }

  /**
   * Formata tipo de dia
   */
  private static formatarTipoDia(tipo: string): string {
    const tipos: Record<string, string> = {
      diurno: 'Diurno',
      noturno: 'Noturno',
      normal: 'Dia Normal',
      sabado: 'Sábado',
      domingo: 'Domingo',
      feriado: 'Feriado',
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Gera nome do arquivo
   */
  private static generateFileName(ext: 'xlsx' | 'pdf', options: HorasExtrasExportOptions): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    let fileName = `horas_extras_${timestamp}`;

    if (options.periodo) {
      const inicio = options.periodo.dataInicio.replace(/-/g, '');
      const fim = options.periodo.dataFim.replace(/-/g, '');
      fileName = `horas_extras_${inicio}_${fim}_${timestamp}`;
    }

    return `${fileName}.${ext}`;
  }
}

