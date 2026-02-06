
import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Scissors, 
  Download, 
  Eye, 
  CheckCircle2, 
  Loader2, 
  X,
  FileText
} from 'lucide-react';
import { splitPdfIntoParts } from './services/pdfService';
import { PDFSplitResult, ProcessingState } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [numSplits, setNumSplits] = useState<number>(2);
  const [results, setResults] = useState<PDFSplitResult[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    status: ''
  });
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setResults([]);
    }
  };

  const reset = () => {
    setFile(null);
    setResults([]);
    setProcessing({ isProcessing: false, progress: 0, status: '' });
  };

  const handleSplit = async () => {
    if (!file) return;

    setProcessing({ isProcessing: true, progress: 0, status: 'Initializing PDF Engine...' });
    
    try {
      const splitResults = await splitPdfIntoParts(file, numSplits, (progress) => {
        setProcessing(prev => ({ ...prev, progress, status: `Splitting parts: ${Math.round(progress)}%` }));
      });

      setResults(splitResults);
    } catch (error) {
      console.error(error);
      alert("An error occurred while splitting the PDF.");
    } finally {
      setProcessing({ isProcessing: false, progress: 100, status: 'Complete' });
    }
  };

  const downloadAll = () => {
    results.forEach((res, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = res.previewUrl;
        link.download = res.name;
        link.click();
      }, index * 300); // Stagger downloads to prevent browser blocking
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="max-w-4xl w-full mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-200">
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Professional PDF <span className="text-indigo-600">Splitter</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Split large PDF documents into manageable parts locally in your browser. Fast, secure, and private.
        </p>
      </header>

      <main className="max-w-4xl w-full space-y-8">
        {!results.length && !processing.isProcessing && (
          <section className="glass-panel rounded-3xl p-8 shadow-2xl border-white border-4">
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf"
                />
                <div className="bg-slate-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <FileUp className="w-12 h-12 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Click to upload your PDF</h3>
                <p className="text-slate-500">Maximum suggested file size: 250MB</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-indigo-100 rounded-full text-indigo-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Number of splits (Max 10)</label>
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">{numSplits}</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="10" 
                    value={numSplits} 
                    onChange={(e) => setNumSplits(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>2 Splits</span>
                    <span>10 Splits</span>
                  </div>
                </div>

                <button 
                  onClick={handleSplit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Scissors className="w-5 h-5" />
                  Split Document Now
                </button>
              </div>
            )}
          </section>
        )}

        {/* Processing State */}
        {processing.isProcessing && (
          <section className="glass-panel rounded-3xl p-12 shadow-2xl border-white border-4 text-center">
            <div className="relative inline-block mb-8">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{processing.status}</h3>
            <div className="max-w-md mx-auto h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300" 
                style={{ width: `${processing.progress}%` }}
              />
            </div>
            <p className="text-slate-500">Splitting and generating file segments...</p>
          </section>
        )}

        {/* Results Grid */}
        {results.length > 0 && !processing.isProcessing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Successfully Split into {results.length} Parts</h3>
                <p className="text-slate-500">Preview and download your files below.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={reset}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 transition-colors"
                >
                  Start Over
                </button>
                <button 
                  onClick={downloadAll}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((res, idx) => (
                <div key={res.id} className="glass-panel p-5 rounded-2xl border-white border-2 hover:shadow-xl transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      <FileText className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase text-slate-400">Part {idx + 1}</span>
                      <p className="text-xs font-medium text-slate-500">Pages {res.pageRange.start} - {res.pageRange.end}</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-6 truncate">{res.name}</h4>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActivePreview(res.previewUrl)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <a 
                      href={res.previewUrl} 
                      download={res.name}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-700 font-bold text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Preview */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Document Preview</h3>
              <button 
                onClick={() => setActivePreview(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-slate-200">
              <iframe 
                src={activePreview} 
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-auto py-12 text-center text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Browser-side Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Privacy Focused</span>
          </div>
        </div>
        <p>© 2024 Professional PDF Splitter. Built with pdf-lib.</p>
      </footer>
    </div>
  );
};

export default App;
