import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Programacao {
  id: string;
  data_programacao: string;
  cliente: string;
  obra: string;
  equipe: string;
  localizacao: string;
  maquinarios: string[];
  status: 'agendada' | 'em_andamento' | 'concluida';
}

export function exportarProgramacaoDiaPDF(date: Date, programacoes: Programacao[]) {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Cores
  const primaryColor = [37, 99, 235]; // blue-600
  const secondaryColor = [107, 114, 128]; // gray-500
  const lightGray = [243, 244, 246]; // gray-100
  
  // Header - Logo e Título
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('WorldPav', margin, 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestão de Pavimentação', margin, 22);
  
  // Data da Programação
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const dataFormatada = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const textWidth = doc.getTextWidth(`Programação: ${dataFormatada}`);
  doc.text(`Programação: ${dataFormatada}`, pageWidth - margin - textWidth, 22);
  
  let yPosition = 45;
  
  // Resumo
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do Dia', margin + 5, yPosition + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total de Programações: ${programacoes.length}`, margin + 5, yPosition + 15);
  
  const agendadas = programacoes.filter(p => p.status === 'agendada').length;
  const emAndamento = programacoes.filter(p => p.status === 'em_andamento').length;
  const concluidas = programacoes.filter(p => p.status === 'concluida').length;
  
  doc.text(`Agendadas: ${agendadas} | Em Andamento: ${emAndamento} | Concluídas: ${concluidas}`, margin + 5, yPosition + 21);
  
  yPosition += 35;
  
  // Programações Detalhadas
  programacoes.forEach((prog, index) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Card da Programação
    const cardHeight = 55;
    
    // Borda colorida baseada no status
    let statusColor: number[];
    switch (prog.status) {
      case 'agendada':
        statusColor = [59, 130, 246]; // blue-500
        break;
      case 'em_andamento':
        statusColor = [234, 179, 8]; // yellow-500
        break;
      case 'concluida':
        statusColor = [34, 197, 94]; // green-500
        break;
      default:
        statusColor = [156, 163, 175]; // gray-400
    }
    
    // Borda lateral colorida
    doc.setFillColor(...statusColor);
    doc.rect(margin, yPosition, 4, cardHeight, 'F');
    
    // Fundo do card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 4, yPosition, pageWidth - 2 * margin - 4, cardHeight, 2, 2, 'FD');
    
    // Conteúdo do card
    const contentX = margin + 10;
    let contentY = yPosition + 8;
    
    // Número e Status
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`#${index + 1}`, contentX, contentY);
    
    // Badge de Status
    const statusText = prog.status === 'agendada' ? 'AGENDADA' : 
                      prog.status === 'em_andamento' ? 'EM ANDAMENTO' : 'CONCLUÍDA';
    const badgeWidth = doc.getTextWidth(statusText) + 6;
    doc.setFillColor(...statusColor);
    doc.roundedRect(pageWidth - margin - badgeWidth - 10, contentY - 4, badgeWidth, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(statusText, pageWidth - margin - badgeWidth - 7, contentY);
    
    contentY += 8;
    
    // Obra (título principal)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(prog.obra, contentX, contentY);
    
    contentY += 7;
    
    // Cliente
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(`Cliente: ${prog.cliente}`, contentX, contentY);
    
    contentY += 6;
    
    // Equipe e Localização
    doc.setFontSize(9);
    doc.text(`👥 Equipe: ${prog.equipe}`, contentX, contentY);
    doc.text(`📍 ${prog.localizacao}`, contentX + 70, contentY);
    
    contentY += 7;
    
    // Maquinários
    doc.setFont('helvetica', 'bold');
    doc.text('Maquinários:', contentX, contentY);
    doc.setFont('helvetica', 'normal');
    
    const maquinariosText = prog.maquinarios.join(', ');
    const maxWidth = pageWidth - 2 * margin - 20;
    const lines = doc.splitTextToSize(maquinariosText, maxWidth);
    
    contentY += 5;
    doc.setFontSize(8);
    lines.forEach((line: string) => {
      doc.text(line, contentX, contentY);
      contentY += 4;
    });
    
    yPosition += cardHeight + 8;
  });
  
  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    
    const footerText = `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`;
    doc.text(footerText, margin, pageHeight - 10);
    
    const pageText = `Página ${i} de ${totalPages}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
  }
  
  // Salvar PDF
  const fileName = `programacao-${format(date, 'dd-MM-yyyy')}.pdf`;
  doc.save(fileName);
}

export function exportarProgramacaoDetalhada(programacao: Programacao) {
  const doc = new jsPDF();
  
  // Similar ao anterior, mas focado em uma programação específica
  // Implementação simplificada
  
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  
  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes da Programação', margin, 20);
  
  let y = 50;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(programacao.obra, margin, y);
  
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${programacao.cliente}`, margin, y);
  
  y += 10;
  doc.text(`Equipe: ${programacao.equipe}`, margin, y);
  
  y += 10;
  doc.text(`Localização: ${programacao.localizacao}`, margin, y);
  
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Maquinários:', margin, y);
  
  y += 8;
  doc.setFont('helvetica', 'normal');
  programacao.maquinarios.forEach(maq => {
    doc.text(`• ${maq}`, margin + 5, y);
    y += 7;
  });
  
  doc.save(`programacao-${programacao.id}.pdf`);
}

