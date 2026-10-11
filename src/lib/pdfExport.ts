/**
 * CVMaker AI - Client PDF Export Engine
 * Generates crisp A4 PDF documents from the live DOM element.
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportPdfOptions {
  filename?: string;
  showWatermark?: boolean;
  quality?: number;
}

export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {}
): Promise<Blob> {
  const filename = options.filename || 'Biodata_Document.pdf';
  
  // Clone element or target directly
  const originalWidth = element.style.width;
  const originalTransform = element.style.transform;

  try {
    // Reset any temporary preview scaling for 1:1 render
    element.style.transform = 'none';

    // Wait for images and fonts to finish rendering
    await document.fonts.ready;
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(true);
            else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            }
          })
      )
    );

    // Capture using html2canvas with scale: 2 for print clarity (300 DPI equivalent)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Multi-page handling if content exceeds single A4 page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // Return blob or trigger download
    const pdfBlob = pdf.output('blob');
    pdf.save(filename);
    return pdfBlob;
  } finally {
    // Restore original transform/width
    element.style.width = originalWidth;
    element.style.transform = originalTransform;
  }
}

/**
 * Triggers clean browser print dialog with print-specific stylesheet
 */
export function printElementDirectly(): void {
  window.print();
}
