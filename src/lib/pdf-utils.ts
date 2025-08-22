import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (
  elementId: string,
  filename: string,
  title?: string
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, 20, 20);
      position = 30;
    }

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export const generateReportPDF = <T extends Record<string, any>>(
  data: T[],
  title: string,
  columns: { key: keyof T; label: string }[],
  filename: string
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Title
  pdf.setFontSize(18);
  pdf.text(title, 20, 20);
  
  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  let yPosition = 45;
  const lineHeight = 7;
  const colWidth = (pageWidth - 40) / columns.length;
  
  // Headers
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  columns.forEach((col, index) => {
    pdf.text(col.label, 20 + (index * colWidth), yPosition);
  });
  
  yPosition += lineHeight;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;
  
  // Data rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  data.forEach((row) => {
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
    
    columns.forEach((col, index) => {
      const value = String(row[col.key] || '');
      pdf.text(value.substring(0, 30), 20 + (index * colWidth), yPosition);
    });
    
    yPosition += lineHeight;
  });
  
  pdf.save(filename);
};
