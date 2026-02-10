
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { imageDb } from '../services/imageDb';
import { useEdit } from './EditContext';

interface EditableImageProps {
  id: string;
  defaultSrc: string;
  className?: string;
  alt?: string;
}

type ToolType = 'zoom' | 'brightness' | 'contrast' | 'intensity' | 'move' | 'none';

const ImageEditorModal: React.FC<{
  src: string;
  targetAspect: number;
  onSave: (newSrc: string) => void;
  onClose: () => void;
}> = ({ src, targetAspect, onSave, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [intensity, setIntensity] = useState(100);
  const [activeTool, setActiveTool] = useState<ToolType>('zoom');
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  }, [isDragging, startPos]);

  const handleMouseUp = () => setIsDragging(false);

  // Precision movement adjustments
  const nudge = (dir: 'u' | 'd' | 'l' | 'r') => {
    const step = 5;
    setOffset(prev => ({
      x: dir === 'l' ? prev.x - step : dir === 'r' ? prev.x + step : prev.x,
      y: dir === 'u' ? prev.y - step : dir === 'd' ? prev.y + step : prev.y,
    }));
  };

  const handleCommit = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution output matching aspect ratio
    const outputWidth = 1600;
    const outputHeight = outputWidth / targetAspect;
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${intensity}%)`;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawWidth = canvas.width * scale;
    const drawHeight = (img.naturalHeight / img.naturalWidth) * drawWidth;
    
    // Calculate mapping from screen coordinate system to canvas coordinate system
    const container = containerRef.current;
    if (!container) return;

    // We need to calculate how much of the image is shown relative to the container's center
    const screenToCanvasFactor = canvas.width / (container.offsetWidth * 0.8);
    const x = (canvas.width - drawWidth) / 2 + (offset.x * screenToCanvasFactor);
    const y = (canvas.height - drawHeight) / 2 + (offset.y * screenToCanvasFactor);

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    onSave(canvas.toDataURL('image/jpeg', 0.95));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in no-print" onMouseUp={handleMouseUp}>
      <div className="relative w-full h-full max-w-7xl flex flex-col gap-6">
        
        {/* Viewport Area - Dominant Screen Space */}
        <div 
          ref={containerRef}
          className="flex-grow bg-black/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden cursor-move touch-none flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {/* The "Safe Zone" Frame - strictly matches original aspect ratio */}
            <div 
              className="border-2 border-white/40 rounded-xl shadow-[0_0_0_2000px_rgba(0,0,0,0.7)]"
              style={{
                width: targetAspect > 1 ? '80%' : `${80 * targetAspect}%`,
                aspectRatio: `${targetAspect}`,
                maxHeight: '80%'
              }}
            ></div>
          </div>
          
          <img 
            ref={imgRef}
            src={src} 
            onLoad={() => setImgLoaded(true)}
            className="absolute transition-transform duration-75 pointer-events-none select-none origin-center"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${intensity}%)`,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              maxWidth: 'none',
              width: '80%',
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Compact Glass Control Menu */}
        <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 p-4 md:p-6 rounded-[2rem] shadow-2xl flex flex-col gap-6 animate-scale-in">
          
          {/* Dynamic Slider Area - Appears when a tool is selected */}
          <div className="h-12 flex items-center px-4">
            {activeTool === 'zoom' && (
              <div className="w-full flex items-center gap-6 animate-fade-in">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest w-20">Zoom</span>
                <input type="range" min="0.1" max="4" step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="flex-grow h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-400" />
                <span className="text-[10px] font-mono text-white/80 w-12">{Math.round(scale * 100)}%</span>
              </div>
            )}
            {activeTool === 'brightness' && (
              <div className="w-full flex items-center gap-6 animate-fade-in">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest w-20">Light</span>
                <input type="range" min="0" max="200" step="1" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="flex-grow h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                <span className="text-[10px] font-mono text-white/80 w-12">{brightness}%</span>
              </div>
            )}
            {activeTool === 'contrast' && (
              <div className="w-full flex items-center gap-6 animate-fade-in">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest w-20">Contrast</span>
                <input type="range" min="0" max="200" step="1" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="flex-grow h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400" />
                <span className="text-[10px] font-mono text-white/80 w-12">{contrast}%</span>
              </div>
            )}
            {activeTool === 'intensity' && (
              <div className="w-full flex items-center gap-6 animate-fade-in">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest w-20">Intensity</span>
                <input type="range" min="0" max="200" step="1" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="flex-grow h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-400" />
                <span className="text-[10px] font-mono text-white/80 w-12">{intensity}%</span>
              </div>
            )}
            {activeTool === 'move' && (
              <div className="w-full flex items-center justify-center gap-12 animate-fade-in">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pixel Nudge</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => nudge('l')} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5"/></svg></button>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => nudge('u')} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="2.5"/></svg></button>
                    <button onClick={() => nudge('d')} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2.5"/></svg></button>
                  </div>
                  <button onClick={() => nudge('r')} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5"/></svg></button>
                </div>
              </div>
            )}
          </div>

          {/* Icon Toolbar */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-1">
              {[
                { id: 'zoom', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>, label: 'Zoom' },
                { id: 'brightness', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2.5"/></svg>, label: 'Brightness' },
                { id: 'contrast', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth="2.5"/></svg>, label: 'Contrast' },
                { id: 'intensity', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" strokeWidth="2.5"/></svg>, label: 'Colors' },
                { id: 'move', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeWidth="2.5"/></svg>, label: 'Position' },
              ].map((tool) => (
                <button 
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolType)}
                  className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${activeTool === tool.id ? 'bg-teal-500 text-teal-950' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  {tool.icon}
                  <span className="text-[7px] font-black uppercase tracking-widest">{tool.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white/50 rounded-xl font-black text-[9px] uppercase tracking-widest hover:text-rose-400 hover:border-rose-400 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleCommit}
                disabled={!imgLoaded}
                className="px-8 py-3 bg-teal-500 text-teal-950 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-white transition-all active:scale-95 disabled:opacity-50"
              >
                Save Edits
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const EditableImage = memo(({ id, defaultSrc, className, alt }: EditableImageProps) => {
  const { isImageEditing } = useEdit();
  const [src, setSrc] = useState(defaultSrc);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1.5); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const loadSavedImage = async () => {
      try {
        const saved = await imageDb.get(id);
        if (active && saved) setSrc(saved);
      } catch (err) {
        console.warn(`Could not load image ${id} from IndexedDB`, err);
      }
    };
    loadSavedImage();
    return () => { active = false; };
  }, [id]);

  const handleEditClick = () => {
    if (displayRef.current) {
      const { width, height } = displayRef.current.getBoundingClientRect();
      // Ensure we have a valid, measurable aspect ratio
      if (width && height) {
        setAspectRatio(width / height);
      }
    }
    setShowEditor(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSrc(base64);
        if (displayRef.current) {
          const { width, height } = displayRef.current.getBoundingClientRect();
          if (width && height) setAspectRatio(width / height);
        }
        setShowEditor(true);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const saveToDb = async (newSrc: string) => {
    setSrc(newSrc);
    setShowEditor(false);
    try {
      await imageDb.save(id, newSrc);
    } catch (e) {
      console.error("Failed to save image persistent storage:", e);
      alert("Storage full or blocked. Change may be lost on refresh.");
    }
  };

  return (
    <div ref={displayRef} className={`relative ${className} ${isImageEditing ? 'z-40' : 'overflow-hidden'}`}>
      <div className={`w-full h-full transition-all duration-500 ${isImageEditing ? 'grayscale opacity-50 blur-[2px] scale-[0.98]' : 'grayscale-0 opacity-100 blur-0 scale-100'}`}>
        <img 
          src={src} 
          alt={alt || "Institutional Asset"} 
          className="w-full h-full object-cover block" 
        />
      </div>
      
      {isImageEditing && !isUploading && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 z-[60] animate-fade-in no-print bg-black/20 backdrop-blur-[2px]">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-teal-700 text-white p-4 rounded-full shadow-2xl hover:bg-teal-800 transition-all transform active:scale-95"
            title="Upload New"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </button>
          
          <button 
            onClick={handleEditClick}
            className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-black transition-all transform active:scale-95"
            title="Adjust & Crop"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m10 0a2 2 0 100-4m0 4a2 2 0 110-4M6 20v-2m0 0V12m0 6h12m0-6v2m0-2V4" /></svg>
          </button>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-[70] rounded-2xl">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showEditor && (
        <ImageEditorModal 
          src={src} 
          targetAspect={aspectRatio}
          onSave={saveToDb} 
          onClose={() => setShowEditor(false)} 
        />
      )}
    </div>
  );
});
