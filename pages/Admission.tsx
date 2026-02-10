
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { COURSES } from '../constants';
import { AdmissionData, Student } from '../types';
import { mockAuth } from '../services/authService';
import { EditableText } from '../components/EditableText';

const AdmissionPhotoEditor: React.FC<{
  src: string;
  onSave: (newSrc: string) => void;
  onClose: () => void;
}> = ({ src, onSave, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  const handleCommit = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // STRICT PASSPORT SIZE (4:5 Ratio - High Def)
    canvas.width = 1200;
    canvas.height = 1500;

    // Fill white background for transparency safety
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate drawing dimensions based on current scale/offset
    const drawWidth = canvas.width * scale;
    const drawHeight = (img.naturalHeight / img.naturalWidth) * drawWidth;
    
    const x = (canvas.width - drawWidth) / 2 + (offset.x * (canvas.width / 320)); // Normalized offset
    const y = (canvas.height - drawHeight) / 2 + (offset.y * (canvas.height / 400)); // Normalized offset

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    onSave(canvas.toDataURL('image/jpeg', 0.95));
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-teal-950/95 backdrop-blur-xl p-4 md:p-10 animate-fade-in no-print" onMouseUp={handleMouseUp}>
      <div className="bg-white rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row h-full max-h-[85vh]">
        <div 
          className="flex-grow bg-slate-900 relative overflow-hidden cursor-move touch-none flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {/* Aspect Ratio Guide (4:5 Passport Standard) */}
            <div className="w-[320px] h-[400px] border-4 border-white/40 rounded shadow-[0_0_0_2000px_rgba(0,0,0,0.7)] flex flex-col items-center justify-start pt-10">
               <div className="w-32 h-40 border border-white/20 rounded-full mb-2"></div>
               <p className="text-[8px] text-white font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Align Face Here</p>
            </div>
          </div>
          <img 
            ref={imgRef}
            src={src} 
            onLoad={() => setImgLoaded(true)}
            className="absolute transition-transform duration-75 pointer-events-none select-none origin-center"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              maxWidth: 'none',
              width: '80%',
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="w-full lg:w-80 p-10 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-100">
          <div className="mb-8">
            <h3 className="text-2xl font-serif text-slate-900 mb-2">Refine ID Photo</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Passport (4:5) Standardization</p>
          </div>

          <div className="space-y-12 flex-grow">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Magnification</label>
                <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">{Math.round(scale * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.01" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100 text-[10px] text-teal-900 font-bold uppercase tracking-widest leading-relaxed">
              Drag your photo to center your face within the guide. Only the area inside the frame will be saved.
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-10">
            <button 
              onClick={handleCommit}
              disabled={!imgLoaded}
              className="w-full py-5 bg-teal-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-teal-800 transition-all active:scale-95 disabled:opacity-50"
            >
              Apply Crop & Finish
            </button>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:text-rose-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CameraModal: React.FC<{ onCapture: (data: string) => void; onClose: () => void; title: string }> = ({ onCapture, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
        if (videoRef.current) videoRef.current.srcObject = s;
        setStream(s);
      } catch (err) {
        alert("Camera access denied or device not found.");
        onClose();
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.95);
      onCapture(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-teal-950/98 backdrop-blur-2xl no-print">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] relative">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h3 className="text-white font-serif text-xl">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
          </button>
        </div>
        <div className="relative aspect-[16/9] bg-black flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-[30%] h-[60%] border-2 border-dashed border-white/30 rounded-full shadow-[0_0_0_2000px_rgba(0,0,0,0.3)]"></div>
             <p className="mt-4 text-[10px] font-black text-white uppercase tracking-[0.4em] bg-teal-600/40 px-4 py-2 rounded-full">Position Face Clearly</p>
          </div>
        </div>
        <div className="p-10 flex justify-center bg-black/40">
          <button onClick={capture} className="w-24 h-24 bg-white rounded-full border-[12px] border-slate-800 shadow-2xl flex items-center justify-center active:scale-90 transition-all group">
            <div className="w-16 h-16 bg-rose-600 rounded-full group-hover:bg-rose-500 transition-colors"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentInput: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (data: string) => void;
  helperText: string;
  required?: boolean;
}> = ({ label, value, onChange, helperText, required }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest block mb-1">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
          <p className="text-[10px] text-slate-600 italic font-medium leading-relaxed max-w-sm">{helperText}</p>
        </div>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Reset Entry</button>
        )}
      </div>

      <div className="relative group">
        {value ? (
          <div className="w-56 h-72 bg-slate-50 border-4 border-teal-600 rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center relative animate-scale-in">
            <img src={value} className="w-full h-full object-cover" alt={label} />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
               <button 
                type="button" 
                onClick={() => setPendingImage(value)}
                className="p-4 bg-teal-600 text-white rounded-2xl shadow-lg hover:bg-teal-500 transition-all transform scale-90 group-hover:scale-100"
                title="Refine Crop"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5"/></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-72 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-6 bg-slate-50 group-hover:bg-slate-100 group-hover:border-teal-300 transition-all overflow-hidden">
            <div className="flex flex-col items-center gap-4 px-6 text-center">
               <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg>
               </div>
               <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white px-8 py-4 rounded-2xl border-2 border-slate-200 shadow-sm text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 hover:bg-teal-50 hover:border-teal-500 transition-all active:scale-95"
                  >
                    Upload File
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="bg-teal-700 text-white px-8 py-4 rounded-2xl shadow-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-teal-800 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2.5"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/></svg>
                    Live Snap
                  </button>
               </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        )}
      </div>

      {isCameraOpen && <CameraModal title={`Standard Identification Capture`} onCapture={setPendingImage} onClose={() => setIsCameraOpen(false)} />}
      
      {pendingImage && (
        <AdmissionPhotoEditor 
          src={pendingImage} 
          onSave={(final) => { onChange(final); setPendingImage(null); }} 
          onClose={() => setPendingImage(null)} 
        />
      )}
    </div>
  );
};

const Admission: React.FC<{ onEnroll: (s: Student) => void }> = ({ onEnroll }) => {
  const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');
  const [formData, setFormData] = useState<AdmissionData>({
    firstName: '', lastName: '', guardianName: '', guardianRelation: 'Father', gender: 'Female',
    email: '', password: '', mobileNumber: '', guardianContact: '', address: '', dateOfBirth: '',
    qualification: '', majorSubject: '', scoreType: 'Percentage', scoreValue: '',
    lastSubject: '', status: 'Student', courseId: '', background: '',
    passportPhoto: '', nicNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<Student | null>(null);

  const [statusEmail, setStatusEmail] = useState('');
  const [statusDOB, setStatusDOB] = useState('');
  const [trackingResult, setTrackingResult] = useState<Student | null | 'none'>(null);

  // Auto-formatting logic for NIC (00000-0000000-0)
  const formatNIC = (val: string) => {
    // Keep only numbers
    const nums = val.replace(/\D/g, '').substring(0, 13);
    let res = '';
    for (let i = 0; i < nums.length; i++) {
      if (i === 5 || i === 12) res += '-';
      res += nums[i];
    }
    return res;
  };

  const handleNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNIC(e.target.value);
    setFormData({ ...formData, nicNumber: formatted });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.passportPhoto) {
      alert("A standardized Passport Photograph (4:5) is mandatory for institutional identity cards.");
      return;
    }
    if (formData.nicNumber.replace(/-/g, '').length < 13) {
      alert("Please provide a valid 13-digit NIC or B-Form Number.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      alert("Institutional portal requires a password of at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    const result = await mockAuth.registerStudent(formData);
    if (result) {
      setSuccessData(result);
    } else {
      alert("Application Conflict: An application with this email already exists in our registry.");
    }
    setIsSubmitting(false);
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await mockAuth.checkStatus(statusEmail, statusDOB);
    setTrackingResult(result || 'none');
  };

  const handlePrint = () => {
    window.print();
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center bg-white p-10 md:p-20 rounded-[4rem] shadow-2xl border border-teal-100 animate-scale-in no-print">
          <div className="w-24 h-24 bg-teal-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-teal-700 shadow-inner">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h2 className="text-4xl font-serif text-slate-900 mb-6 block">Application Synced</h2>
          <p className="text-slate-600 mb-12 text-base font-light leading-relaxed block">Your documentation has been shifted to the <span className="font-bold text-teal-700">Pending Registry</span>. Academic reviewers will audit your file within 48 hours.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={handlePrint} className="py-6 bg-teal-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-teal-800 shadow-xl transition-all">Export Digital Copy</button>
             <button onClick={() => { setSuccessData(null); setActiveTab('status'); }} className="py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all">Track Status</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 md:py-32 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <EditableText id="admission_page_badge" defaultText="INSTITUTIONAL REGISTRY" className="text-teal-700 font-black uppercase tracking-[0.6em] text-xs block mb-4" />
          <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mt-2 block">
            <EditableText id="admission_page_title" defaultText="Admission Hub" />
          </h1>
          
          <div className="flex flex-wrap justify-center mt-12 gap-4">
            <div className="bg-white p-2.5 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-wrap gap-2">
              <button onClick={() => setActiveTab('apply')} className={`px-10 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'apply' ? 'bg-teal-700 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-teal-700'}`}>Start Application</button>
              <button onClick={() => setActiveTab('status')} className={`px-10 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'status' ? 'bg-teal-700 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-teal-700'}`}>Tracking Portal</button>
            </div>
          </div>
        </div>

        {activeTab === 'apply' ? (
          <form onSubmit={handleFinalSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in">
            <div className="lg:col-span-8 space-y-12">
              <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100">
                <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                  <div className="w-14 h-14 bg-teal-700 text-white rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-lg">01</div>
                  <div>
                    <h3 className="text-3xl font-serif text-slate-900 block">Candidate Profile</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Identification Node</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Given Name</label><input required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Family Name</label><input required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                  
                  {/* NIC Number Field with Masking */}
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">NIC / B-Form Number <span className="text-rose-600">*</span></label>
                    <input 
                      required 
                      placeholder="00000-0000000-0" 
                      className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all font-mono text-lg tracking-widest" 
                      value={formData.nicNumber} 
                      onChange={handleNICChange} 
                    />
                  </div>

                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Guardian Name</label><input required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all" value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Date of Birth</label><input required type="date" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Primary Contact</label><input required placeholder="03XXXXXXXXX" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all font-mono" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Guardian Contact</label><input required placeholder="03XXXXXXXXX" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all font-mono" value={formData.guardianContact} onChange={e => setFormData({...formData, guardianContact: e.target.value})} /></div>
                  <div className="md:col-span-2 space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Permanent Address</label><textarea required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl h-32 resize-none focus:border-teal-500 outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                </div>
              </div>

              <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100">
                <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                  <div className="w-14 h-14 bg-teal-700 text-white rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-lg">02</div>
                  <div>
                    <h3 className="text-3xl font-serif text-slate-900 block">Identity Lock</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Credentials Generation</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">Portal ID (Email)</label><input required type="email" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-4">LMS Key (Password)</label><input required type="password" placeholder="Min 6 characters" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-teal-500 outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                </div>
              </div>

              <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100">
                <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                  <div className="w-14 h-14 bg-teal-700 text-white rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-lg">03</div>
                  <div>
                    <h3 className="text-3xl font-serif text-slate-900 block">Verification Assets</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photographic Documentation</p>
                  </div>
                </div>
                <DocumentInput label="Formal Passport Photograph" value={formData.passportPhoto} onChange={(data) => setFormData({...formData, passportPhoto: data})} helperText="Strictly 4:5 aspect ratio. Please use the built-in refinement tool for standardization." required />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-teal-950 p-12 rounded-[4rem] text-white sticky top-32 shadow-[0_40px_100px_-20px_rgba(13,148,136,0.4)] border border-teal-800">
                <div className="mb-10 text-center">
                  <EditableText id="selection_summary_badge" defaultText="REGISTRY STATUS" className="text-teal-500 font-black uppercase tracking-[0.4em] text-[10px] block mb-4" />
                  <h4 className="text-3xl font-serif block">Final Submission</h4>
                </div>
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-teal-500 uppercase tracking-widest ml-2">Intended Vocational Trade</label>
                    <select required className="w-full p-6 bg-teal-900 text-white border-2 border-teal-800 rounded-3xl outline-none focus:border-teal-400 transition-all font-bold appearance-none cursor-pointer" value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                      <option value="">Select Specialization</option>
                      {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-6 py-8 border-y border-white/10">
                     <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 bg-teal-600/30 rounded flex items-center justify-center flex-shrink-0 mt-1">
                           <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>
                        </div>
                        <p className="text-[11px] text-teal-100/60 leading-relaxed font-medium">
                          I verify that all entered data matches my official CNIC/Form-B records exactly.
                        </p>
                     </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-7 bg-teal-500 text-teal-950 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-white hover:scale-[1.02] transition-all shadow-2xl active:scale-95 disabled:opacity-50">
                    {isSubmitting ? 'Syncing to Cloud...' : 'Commit to Registry'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100">
              <div className="text-center mb-12">
                 <h2 className="text-3xl font-serif text-slate-900 block">Registry Tracking Portal</h2>
                 <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-widest font-black bg-slate-50 py-2 inline-block px-6 rounded-full border border-slate-100">Cross-Table Search Active</p>
              </div>
              <form onSubmit={handleCheckStatus} className="space-y-8">
                <input required type="email" placeholder="Institutional Email ID" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-teal-500 transition-all font-medium" value={statusEmail} onChange={e => setStatusEmail(e.target.value)} />
                <input required type="date" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-teal-500 transition-all font-medium" value={statusDOB} onChange={e => setStatusDOB(e.target.value)} />
                <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95">Retrieve Verification Status</button>
              </form>
              
              {trackingResult !== null && (
                <div className="mt-12 p-12 bg-slate-50 rounded-[3.5rem] border border-slate-200 text-center animate-scale-in">
                  {trackingResult === 'none' ? (
                    <div className="space-y-4">
                       <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2"/></svg></div>
                       <p className="text-rose-700 font-black uppercase text-[11px] tracking-widest">No matching record found in registries.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-widest border-b pb-4">Verification Metadata</p>
                      
                      {trackingResult.admissionStatus === 'approved' && (
                         <div className="space-y-8">
                            <span className="inline-block px-10 py-3 bg-emerald-100 text-emerald-900 border-2 border-emerald-200 rounded-full font-black text-[10px] uppercase tracking-[0.2em]">TABLE: WITHDRAWAL REGISTRY</span>
                            <h4 className="text-4xl font-serif text-emerald-700">Verification Active</h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium italic">Your candidate file has been shifted to the Enrolled Table. Portal access is now granted.</p>
                         </div>
                      )}
                      
                      {trackingResult.admissionStatus === 'rejected' && (
                         <div className="space-y-8">
                            <span className="inline-block px-10 py-3 bg-rose-100 text-rose-900 border-2 border-rose-200 rounded-full font-black text-[10px] uppercase tracking-[0.2em]">TABLE: REJECTED ARCHIVES</span>
                            <h4 className="text-4xl font-serif text-rose-700">Admission Terminated</h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium italic">Eligibility audit failed. Please contact the registrar office for specific non-compliance details.</p>
                         </div>
                      )}
                      
                      {trackingResult.admissionStatus === 'pending' && (
                         <div className="space-y-8">
                            <span className="inline-block px-10 py-3 bg-amber-100 text-amber-900 border-2 border-amber-200 rounded-full font-black text-[10px] uppercase tracking-[0.2em]">TABLE: PENDING QUEUE</span>
                            <h4 className="text-4xl font-serif text-amber-700">Review In Progress</h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium italic">Your file is currently sitting in the 'Applications' register awaiting verification by the Principal.</p>
                         </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admission;
