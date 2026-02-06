
export interface PDFSplitResult {
  id: string;
  name: string;
  blob: Blob;
  previewUrl: string;
  pageRange: { start: number; end: number };
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  status: string;
}
