import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DiariaExportData {
  id: string;
  colaborador_nome: string;
  colaborador_funcao?: string;
  quantidade: number;
  valor_unitario: number;
  adicional: number;
  desconto: number;
  valor_total: number;
  data_diaria: string;
  data_pagamento?: string;
  status_pagamento: 'pendente' | 'pago' | 'cancelado';
  observacoes?: string;
  created_at: string;
}

export interface DiariasExportOptions {
  periodo?: {
    dataInicio: string;
    dataFim: string;
  };
  filtros?: {
    nome?: string;
    equipe?: string;
    status?: string;
  };
}

export class DiariasExporter {
  /**
   * Exporta diárias para Excel
   */
  static exportToExcel(
    data: DiariaExportData[],
    options: DiariasExportOptions = {}
  ): void {
    try {
      console.log('🚀 Iniciando exportação Excel de diárias...');

      if (!data || data.length === 0) {
        throw new Error('Nenhuma diária encontrada para exportar');
      }

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Preparar dados para a planilha principal
      const dadosPlanilha = data.map((item) => ({
        'Colaborador': item.colaborador_nome,
        'Função': item.colaborador_funcao || '-',
        'Quantidade': item.quantidade,
        'Valor Unitário (R$)': item.valor_unitario,
        'Adicional (R$)': item.adicional,
        'Desconto (R$)': item.desconto,
        'Valor Total (R$)': item.valor_total,
        'Data da Diária': this.formatarDataBR(item.data_diaria),
        'Data de Pagamento': item.data_pagamento ? this.formatarDataBR(item.data_pagamento) : '-',
        'Status': this.formatarStatus(item.status_pagamento),
        'Observações': item.observacoes || '-',
        'Registrado em': this.formatarDataHoraBR(item.created_at),
      }));

      // Criar worksheet principal
      const ws = XLSX.utils.json_to_sheet(dadosPlanilha);

      // Ajustar largura das colunas
      ws['!cols'] = [
        { wch: 30 }, // Colaborador
        { wch: 25 }, // Função
        { wch: 12 }, // Quantidade
        { wch: 18 }, // Valor Unitário
        { wch: 15 }, // Adicional
        { wch: 15 }, // Desconto
        { wch: 18 }, // Valor Total
        { wch: 15 }, // Data da Diária
        { wch: 18 }, // Data de Pagamento
        { wch: 12 }, // Status
        { wch: 40 }, // Observações
        { wch: 20 }, // Registrado em
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Diárias');

      // Criar planilha de resumo
      const resumo = this.calcularResumo(data);
      const resumoData = [
        ['Resumo de Diárias'],
        [],
        ['Total de Registros', resumo.totalRegistros],
        ['Total de Diárias', resumo.totalQuantidade],
        ['Valor Total', `R$ ${resumo.valorTotal.toFixed(2)}`],
        ['Valor Pendente', `R$ ${resumo.valorPendente.toFixed(2)}`],
        ['Valor Pago', `R$ ${resumo.valorPago.toFixed(2)}`],
        [],
        ['Por Status'],
        ...resumo.porStatus.map(item => [item.status, item.quantidade, `R$ ${item.valor.toFixed(2)}`]),
        [],
        ['Por Colaborador'],
        ...resumo.porColaborador.map(item => [item.colaborador, item.quantidade, `R$ ${item.valor.toFixed(2)}`]),
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
   * Exporta diárias para PDF profissional
   */
  static exportToPDF(
    data: DiariaExportData[],
    options: DiariasExportOptions = {}
  ): void {
    try {
      console.log('🚀 Iniciando exportação PDF de diárias...');

      if (!data || data.length === 0) {
        throw new Error('Nenhuma diária encontrada para exportar');
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

      // Adicionar tabela de diárias
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
    options: DiariasExportOptions,
    yPosition: number
  ): number {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Título
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório de Diárias', pageWidth / 2, yPosition, { align: 'center' });

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
      ['Total de Diárias', resumo.totalQuantidade.toString()],
      ['Valor Total', `R$ ${resumo.valorTotal.toFixed(2)}`],
      ['Valor Pendente', `R$ ${resumo.valorPendente.toFixed(2)}`],
      ['Valor Pago', `R$ ${resumo.valorPago.toFixed(2)}`],
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
   * Adiciona tabela de diárias ao PDF
   */
  private static addPDFTable(
    pdf: jsPDF,
    data: DiariaExportData[],
    yPosition: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    // Preparar dados da tabela
    const tableData = data.map((item) => [
      item.colaborador_nome,
      item.colaborador_funcao || '-',
      item.quantidade.toString(),
      `R$ ${item.valor_unitario.toFixed(2)}`,
      `R$ ${item.adicional.toFixed(2)}`,
      `R$ ${item.desconto.toFixed(2)}`,
      `R$ ${item.valor_total.toFixed(2)}`,
      this.formatarDataBR(item.data_diaria),
      item.data_pagamento ? this.formatarDataBR(item.data_pagamento) : '-',
      this.formatarStatus(item.status_pagamento),
    ]);

    try {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Colaborador', 'Função', 'Qtd', 'Valor Unit.', 'Adicional', 'Desconto', 'Total', 'Data Diária', 'Data Pag.', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 22, halign: 'right' },
          7: { cellWidth: 22 },
          8: { cellWidth: 22 },
          9: { cellWidth: 20 },
        },
        margin: { left: 15, right: 15 },
        pageBreak: 'auto',
        showHead: 'everyPage',
      });
    } catch (error) {
      console.error('Erro ao adicionar tabela principal:', error);
      // Fallback: adicionar dados como texto
      pdf.setFontSize(7);
      let currentY = yPosition;
      // Adicionar cabeçalho manualmente
      const headers = ['Colaborador', 'Função', 'Qtd', 'Valor Unit.', 'Adicional', 'Desconto', 'Total', 'Data Diária', 'Data Pag.', 'Status'];
      pdf.setFont('helvetica', 'bold');
      const xPositions = [15, 50, 80, 95, 115, 135, 155, 177, 199, 221];
      headers.forEach((header, colIndex) => {
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
            pdf.text(header, xPositions[colIndex] || 15, currentY);
          });
          currentY += 5;
          pdf.setFont('helvetica', 'normal');
        }
        row.forEach((cell, colIndex) => {
          pdf.text(String(cell), xPositions[colIndex] || 15, currentY);
        });
        currentY += 6;
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
   * Calcula resumo das diárias
   */
  private static calcularResumo(data: DiariaExportData[]) {
    const totalRegistros = data.length;
    const totalQuantidade = data.reduce((sum, item) => sum + item.quantidade, 0);
    const valorTotal = data.reduce((sum, item) => sum + item.valor_total, 0);
    const valorPendente = data
      .filter(item => item.status_pagamento === 'pendente')
      .reduce((sum, item) => sum + item.valor_total, 0);
    const valorPago = data
      .filter(item => item.status_pagamento === 'pago')
      .reduce((sum, item) => sum + item.valor_total, 0);

    // Agrupar por status
    const porStatusMap = new Map<string, { quantidade: number; valor: number }>();
    data.forEach((item) => {
      const status = this.formatarStatus(item.status_pagamento);
      const atual = porStatusMap.get(status) || { quantidade: 0, valor: 0 };
      porStatusMap.set(status, {
        quantidade: atual.quantidade + item.quantidade,
        valor: atual.valor + item.valor_total,
      });
    });

    const porStatus = Array.from(porStatusMap.entries()).map(([status, dados]) => ({
      status,
      quantidade: dados.quantidade,
      valor: dados.valor,
    }));

    // Agrupar por colaborador
    const porColaboradorMap = new Map<string, { quantidade: number; valor: number }>();
    data.forEach((item) => {
      const atual = porColaboradorMap.get(item.colaborador_nome) || { quantidade: 0, valor: 0 };
      porColaboradorMap.set(item.colaborador_nome, {
        quantidade: atual.quantidade + item.quantidade,
        valor: atual.valor + item.valor_total,
      });
    });

    const porColaborador = Array.from(porColaboradorMap.entries())
      .map(([colaborador, dados]) => ({
        colaborador,
        quantidade: dados.quantidade,
        valor: dados.valor,
      }))
      .sort((a, b) => b.valor - a.valor);

    return {
      totalRegistros,
      totalQuantidade,
      valorTotal,
      valorPendente,
      valorPago,
      porStatus,
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
   * Formata status
   */
  private static formatarStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      pago: 'Pago',
      cancelado: 'Cancelado',
    };
    return statusMap[status] || status;
  }

  /**
   * Gera nome do arquivo
   */
  private static generateFileName(ext: 'xlsx' | 'pdf', options: DiariasExportOptions): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    let fileName = `diarias_${timestamp}`;

    if (options.periodo) {
      const inicio = options.periodo.dataInicio.replace(/-/g, '');
      const fim = options.periodo.dataFim.replace(/-/g, '');
      fileName = `diarias_${inicio}_${fim}_${timestamp}`;
    }

    return `${fileName}.${ext}`;
  }
}


