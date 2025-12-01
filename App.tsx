import React, { useState, useCallback, useRef } from 'react';
import { AppState, ProcessedImage } from './types';
import { removeWatermark } from './services/gemini';
import { UploadIcon, WandIcon, DownloadIcon, XIcon, LoaderIcon, ImageIcon } from './components/Icons';
import CompareSlider from './components/CompareSlider';

const DEFAULT_PROMPT = "Remove the watermark, text overlays, and logos from this image.";

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    // Validate image
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResultUrl(null);
    setAppState(AppState.IDLE);
    setErrorMsg(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setAppState(AppState.PROCESSING);
    setErrorMsg(null);

    try {
      const processedImageBase64 = await removeWatermark(file, customPrompt);
      setResultUrl(processedImageBase64);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "An unexpected error occurred while processing the image.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setAppState(AppState.IDLE);
    setErrorMsg(null);
    setCustomPrompt(DEFAULT_PROMPT);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `cleaned-${file?.name || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center p-4 md:p-8">
      
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
             <WandIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Watermark Remover AI
          </h1>
        </div>
        <div className="text-sm text-slate-500 hidden sm:block">
          Powered by Gemini 2.5
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Main Workspace */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
            
            {/* Error Banner */}
            {errorMsg && (
                <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white p-3 text-center text-sm z-20 backdrop-blur-md">
                    {errorMsg}
                    <button onClick={() => setErrorMsg(null)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Empty State / Upload Area */}
            {!file ? (
                <div 
                    className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-700 m-4 rounded-xl transition-colors hover:border-indigo-500/50 hover:bg-slate-800/30"
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                >
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <UploadIcon className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Upload an image to start</h3>
                    <p className="text-slate-400 mb-8 text-center max-w-xs">
                        Drag and drop your image here, or click to browse. Supports JPG, PNG, WEBP.
                    </p>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileInputChange}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Select Image
                    </button>
                    
                    <div className="mt-12 flex gap-4 text-xs text-slate-600 uppercase tracking-wider font-semibold">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Doubao</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Jimeng</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Any Watermark</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col p-6">
                    {/* Top Bar inside workspace */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                           <ImageIcon className="w-4 h-4" />
                           <span className="truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button onClick={handleReset} className="text-xs text-slate-500 hover:text-white transition-colors">
                            Change Image
                        </button>
                    </div>

                    {/* Image Area */}
                    <div className="flex-1 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800/50 p-4 relative min-h-[300px]">
                        {appState === AppState.PROCESSING ? (
                             <div className="flex flex-col items-center animate-pulse">
                                <LoaderIcon className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                <p className="text-lg font-medium text-indigo-300">Removing watermark...</p>
                                <p className="text-sm text-slate-500 mt-2">AI is analyzing pixels</p>
                             </div>
                        ) : resultUrl ? (
                            <CompareSlider beforeImage={previewUrl!} afterImage={resultUrl} />
                        ) : (
                             <img 
                                src={previewUrl!} 
                                alt="Original Preview" 
                                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl" 
                             />
                        )}
                    </div>

                    {/* Controls Footer */}
                    <div className="mt-6 flex flex-col md:flex-row gap-4 items-end md:items-center">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Instructions</label>
                            <input 
                                type="text" 
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="E.g. Remove the logo in the bottom right corner..."
                                disabled={appState === AppState.PROCESSING}
                            />
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                            {resultUrl ? (
                                <>
                                    <button 
                                        onClick={handleProcess}
                                        disabled={appState === AppState.PROCESSING}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
                                    >
                                        Redo
                                    </button>
                                    <button 
                                        onClick={handleDownload}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        <DownloadIcon className="w-4 h-4" />
                                        Download
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={handleProcess}
                                    disabled={appState === AppState.PROCESSING}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <WandIcon className="w-4 h-4" />
                                    Magic Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Info / FAQ Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400">
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                 <h4 className="font-semibold text-slate-200 mb-2">How it works</h4>
                 <p className="text-sm">We use Google's advanced Gemini 2.5 Flash Image model to analyze the image structure and intelligently inpaint over watermark areas.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                 <h4 className="font-semibold text-slate-200 mb-2">Supported Formats</h4>
                 <p className="text-sm">Works best with high-resolution JPG and PNG files. Perfect for removing Doubao, Jimeng, and other social media app watermarks.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                 <h4 className="font-semibold text-slate-200 mb-2">Privacy First</h4>
                 <p className="text-sm">Images are processed directly via the API securely. We do not store your personal photos on any server.</p>
             </div>
        </div>

      </main>
    </div>
  );
}