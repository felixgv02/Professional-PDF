
import { PDFDocument } from 'pdf-lib';
import { PDFSplitResult } from '../types';

export const splitPdfIntoParts = async (
  file: File,
  numSplits: number,
  onProgress: (progress: number) => void
): Promise<PDFSplitResult[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();
  
  const results: PDFSplitResult[] = [];
  const pagesPerSplit = Math.ceil(totalPages / numSplits);

  for (let i = 0; i < numSplits; i++) {
    const start = i * pagesPerSplit;
    const end = Math.min((i + 1) * pagesPerSplit - 1, totalPages - 1);

    if (start >= totalPages) break;

    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from({ length: end - start + 1 }, (_, index) => start + index);
    
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const previewUrl = URL.createObjectURL(blob);

    results.push({
      id: Math.random().toString(36).substr(2, 9),
      name: `${file.name.replace('.pdf', '')}_part_${i + 1}.pdf`,
      blob,
      previewUrl,
      pageRange: { start: start + 1, end: end + 1 }
    });

    onProgress(((i + 1) / numSplits) * 100);
  }

  return results;
};
