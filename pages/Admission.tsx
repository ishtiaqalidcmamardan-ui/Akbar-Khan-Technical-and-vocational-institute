
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Course, AdmissionData, Student } from '../types';
import { mockAuth } from '../services/authService';
import { EditableText } from '../components/EditableText';

// ... (AdmissionPhotoEditor, CameraModal, DocumentInput, FormSection, FormInput remain largely the same)

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
    canvas.width = 1200;
    canvas.height = 1500;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const drawWidth = canvas.width * scale;
    const drawHeight = (img.naturalHeight / img.naturalWidth) * drawWidth;
    const x = (canvas.width - drawWidth) / 2 + (offset.x * (canvas.width / 320));
    const y = (canvas.height - drawHeight) / 2 + (offset.y * (canvas.height / 400));
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    // Optimized: Changed image/jpeg to image/webp
    onSave(canvas.toDataURL('image/webp', 0.95));
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 animate-fade-in no-print" onMouseUp={handleMouseUp}>
      <div className="bg-white rounded-none w-full max-w-5xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row h-full max-h-[85vh] border border-slate-800">
        <div 
          className="flex-grow bg-slate-100 relative overflow-hidden cursor-move touch-none flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-[320px] h-[400px] border-2 border-teal-600 rounded-none shadow-[0_0_0_2000px_rgba(255,255,255,0.8)] flex flex-col items-center justify-start pt-10">
               <p className="text-[10px] text-teal-800 font-black uppercase tracking-widest bg-white border border-teal-600 px-3 py-1">Photo Capture Guide</p>
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
        <div className="w-full lg:w-80 p-8 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-200">
          <h3 className="text-2xl font-serif text-slate-900 mb-2">Refine Identity</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 pb-4 border-b border-slate-100">Passport Standard 4:5</p>
          <div className="space-y-10 flex-grow">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Magnification</label>
              <input type="range" min="0.1" max="3" step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-none appearance-none cursor-pointer accent-teal-700" />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-10">
            <button onClick={handleCommit} disabled={!imgLoaded} className="w-full py-5 bg-teal-800 text-white rounded-none font-black text-[11px] uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:bg-teal-900 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">Commit to File</button>
            <button onClick={onClose} className="w-full py-4 bg-white text-slate-500 border border-slate-200 rounded-none font-black text-[10px] uppercase tracking-widest hover:text-rose-600 transition-all">Discard</button>
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
      } catch (err) { onClose(); }
    }
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);
  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current;
      const c = canvasRef.current;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      // Optimized: Changed capture output to image/webp
      c.getContext('2d')?.drawImage(v, 0, 0);
      onCapture(c.toDataURL('image/webp', 0.95));
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 no-print">
      <div className="bg-white w-full max-w-2xl rounded-none overflow-hidden shadow-2xl border border-slate-800">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-slate-900 font-bold uppercase tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
        </div>
        <div className="relative aspect-[16/9] bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="p-8 flex justify-center bg-slate-50 border-t border-slate-200">
          <button onClick={capture} className="px-12 py-5 bg-teal-800 text-white font-black uppercase tracking-[0.3em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">Capture Snapshot</button>
        </div>
      </div>
    </div>
  );
};

const DocumentInput: React.FC<{ label: string; value: string; onChange: (data: string) => void; helperText: string; required?: boolean; }> = ({ label, value, onChange, helperText, required }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] block mb-1">{label} {required && <span className="text-rose-600">*</span>}</label>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{helperText}</p>
        </div>
      </div>
      <div className="relative">
        {value ? (
          <div className="w-40 h-52 bg-white border border-slate-900 rounded-none overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.05)] relative group animate-scale-in">
            <img src={value} className="w-full h-full object-cover" alt={label} />
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button type="button" onClick={() => setPendingImage(value)} className="p-3 bg-white text-slate-900 border border-slate-900 font-black uppercase text-[10px]">Adjust</button>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 border-2 border-dashed border-slate-300 rounded-none flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-teal-700 transition-all group">
            <div className="flex flex-col items-center gap-6 px-10 text-center">
               <div className="flex gap-4">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white border border-slate-900 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">Upload File</button>
                  <button type="button" onClick={() => setIsCameraOpen(true)} className="px-6 py-3 bg-teal-800 text-white border border-teal-900 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">Live Sensor</button>
               </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const r = new FileReader();
                 r.onloadend = () => setPendingImage(r.result as string);
                 r.readAsDataURL(file);
               }
            }} />
          </div>
        )}
      </div>
      {isCameraOpen && <CameraModal title={`Registry Identification Capture`} onCapture={setPendingImage} onClose={() => setIsCameraOpen(false)} />}
      {pendingImage && <AdmissionPhotoEditor src={pendingImage} onSave={(f) => { onChange(f); setPendingImage(null); }} onClose={() => setPendingImage(null)} />}
    </div>
  );
};

const FormSection: React.FC<{ title: string; subtitle: string; children: React.ReactNode; step: string }> = ({ title, subtitle, children, step }) => (
  <div className="bg-white p-8 md:p-14 rounded-none shadow-[10px_10px_0px_rgba(0,0,0,0.02)] border border-slate-200">
    <div className="flex items-start gap-8 mb-12 border-l-4 border-teal-800 pl-8">
      <div className="flex flex-col">
        <h3 className="text-3xl font-serif text-slate-900 leading-none mb-3">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{subtitle} — Step {step}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">{children}</div>
  </div>
);

const FormInput: React.FC<{ label: string; placeholder?: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; colSpan?: boolean }> = ({ label, placeholder, type = "text", value, onChange, required, colSpan }) => (
  <div className={`space-y-2.5 ${colSpan ? 'md:col-span-2' : ''}`}>
    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1">{label} {required && <span className="text-rose-600 font-black">*</span>}</label>
    <input required={required} type={type} placeholder={placeholder} className="w-full p-4 bg-white border border-slate-900 rounded-none text-[13px] text-slate-900 font-bold focus:border-teal-700 outline-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.03)]" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const Admission: React.FC<{ onEnroll: (s: Student) => void }> = ({ onEnroll }) => {
  const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<AdmissionData>({
    firstName: '', lastName: '', guardianName: '', guardianRelation: 'Father', gender: 'Female',
    email: '', password: '', mobileNumber: '', guardianContact: '', address: '', dateOfBirth: '',
    qualification: '', majorSubject: '', scoreType: 'Percentage', scoreValue: '',
    lastSubject: '', status: 'Student', 
    courseId: '', background: '',
    passportPhoto: '', nicNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<Student | null>(null);
  const [statusEmail, setStatusEmail] = useState('');
  const [statusDOB, setStatusDOB] = useState('');
  const [trackingResult, setTrackingResult] = useState<Student | null | 'none'>(null);

  useEffect(() => {
    mockAuth.getCourses().then(setCourses);
  }, []);

  const handleNICChange = (v: string) => {
    const nums = v.replace(/\D/g, '').substring(0, 13);
    let res = '';
    for (let i = 0; i < nums.length; i++) {
      if (i === 5 || i === 12) res += '-';
      res += nums[i];
    }
    setFormData({ ...formData, nicNumber: res });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.passportPhoto) {
      alert("Verification Error: Identification photograph mandatory.");
      return;
    }
    if (!formData.courseId) {
       alert("Verification Error: Please select an Academic Specialization.");
       return;
    }
    setIsSubmitting(true);
    const result = await mockAuth.registerStudent(formData);
    if (result) setSuccessData(result);
    else alert("Conflict detected: Candidate record already exists in the central registry.");
    setIsSubmitting(false);
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await mockAuth.checkStatus(statusEmail, statusDOB);
    setTrackingResult(result || 'none');
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white p-12 md:p-24 border border-slate-900 shadow-[30px_30px_0px_rgba(0,0,0,0.05)] animate-scale-in text-center no-print">
          <div className="w-24 h-24 bg-teal-50 border border-teal-200 rounded-none flex items-center justify-center mx-auto mb-12 text-teal-800 shadow-inner">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
          </div>
          <h2 className="text-4xl font-serif text-slate-900 mb-6 uppercase tracking-tight">Record Synchronized</h2>
          <p className="text-slate-500 mb-16 text-lg font-light leading-relaxed max-w-md mx-auto">Your candidate file has been committed to the institutional registry. Verification is now pending administrative audit.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => window.print()} className="py-5 bg-teal-800 text-white rounded-none font-black text-[11px] uppercase tracking-[0.2em] shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">Generate Record Print</button>
             <button onClick={() => { setSuccessData(null); window.location.hash = '#portal-hub'; }} className="py-5 bg-slate-900 text-white rounded-none font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">LMS Portal Access</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 md:py-40 bg-slate-100 min-h-screen border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-32">
          <EditableText id="admission_page_badge" defaultText="AUTHORIZED REGISTRATION NODE" className="text-teal-800 font-black uppercase tracking-[0.8em] text-[11px] block mb-6" />
          <h1 className="text-6xl md:text-[8rem] font-serif text-slate-950 mt-2 block tracking-tighter leading-none">Admission<br/><span className="italic text-teal-700">Protocol</span></h1>
          <div className="flex justify-center mt-20">
            <div className="bg-white p-1 border border-slate-900 flex shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
              <button onClick={() => setActiveTab('apply')} className={`px-12 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'apply' ? 'bg-teal-800 text-white' : 'text-slate-400 hover:text-slate-900'}`}>Initiate Enrollment</button>
              <button onClick={() => setActiveTab('status')} className={`px-12 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'status' ? 'bg-teal-800 text-white' : 'text-slate-400 hover:text-slate-900'}`}>Tracking Node</button>
            </div>
          </div>
        </div>

        {activeTab === 'apply' ? (
          <form onSubmit={handleFinalSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-fade-in">
            <div className="lg:col-span-8 space-y-16">
              <FormSection step="I" title="Candidate Identity" subtitle="Primary Institutional Verification">
                <FormInput label="Given Name" placeholder="First Name" value={formData.firstName} onChange={v => setFormData({...formData, firstName: v})} required />
                <FormInput label="Lineage Name" placeholder="Family Name" value={formData.lastName} onChange={v => setFormData({...formData, lastName: v})} required />
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">State Identification (NIC / B-Form)</label>
                  <input required placeholder="00000-0000000-0" className="w-full p-6 bg-white border border-slate-900 rounded-none font-mono text-2xl tracking-[0.3em] text-slate-900 focus:bg-slate-50 focus:border-teal-700 outline-none transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.05)]" value={formData.nicNumber} onChange={e => handleNICChange(e.target.value)} />
                </div>
                <FormInput label="Guardian Nomenclature" placeholder="Father/Husband Name" value={formData.guardianName} onChange={v => setFormData({...formData, guardianName: v})} required />
                <FormInput label="Date of Chronology" type="date" value={formData.dateOfBirth} onChange={v => setFormData({...formData, dateOfBirth: v})} required />
                <FormInput label="Direct Communication" placeholder="0300 0000000" value={formData.mobileNumber} onChange={v => setFormData({...formData, mobileNumber: v})} required />
                <FormInput label="Emergency Contact" placeholder="0300 0000000" value={formData.guardianContact} onChange={v => setFormData({...formData, guardianContact: v})} required />
                <div className="md:col-span-2 space-y-2.5">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Domiciliary Address</label>
                  <textarea required className="w-full p-5 bg-white border border-slate-900 rounded-none h-40 resize-none text-[13px] text-slate-900 font-bold focus:border-teal-700 outline-none transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.05)]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </FormSection>
              <FormSection step="II" title="Secure Portal Access" subtitle="Digital Credential Assignment">
                <FormInput label="Institutional Account (Email)" type="email" placeholder="Verification required" value={formData.email} onChange={v => setFormData({...formData, email: v})} required />
                <FormInput label="Master Access Key (Password)" type="password" placeholder="Minimum 8 characters" value={formData.password} onChange={v => setFormData({...formData, password: v})} required />
              </FormSection>
              <div className="bg-white p-8 md:p-14 border border-slate-200 shadow-[10px_10px_0px_rgba(0,0,0,0.02)]">
                 <div className="flex items-center gap-8 mb-12 border-l-4 border-teal-800 pl-8">
                    <div><h3 className="text-3xl font-serif text-slate-900 mb-2">Identification Node</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Biometric Asset Synchronization — Step III</p></div>
                 </div>
                 <DocumentInput label="Formal Passport Portrait" value={formData.passportPhoto} onChange={(data) => setFormData({...formData, passportPhoto: data})} helperText="High-density 4:5 ratio image with clear background strictly required for the TTB registry." required />
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="bg-slate-900 p-10 rounded-none text-white sticky top-32 border-l-[12px] border-teal-700 shadow-[20px_20px_0px_rgba(0,0,0,0.1)]">
                <h4 className="text-2xl font-serif mb-2">Final Protocol</h4>
                <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.3em] mb-12 border-b border-white/10 pb-6">Pre-Submission Audit</p>
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Specialization</label>
                    <select required className="w-full p-5 bg-white border border-slate-800 rounded-none text-slate-900 font-black text-[11px] uppercase tracking-widest appearance-none cursor-pointer outline-none transition-all" value={formData.courseId} 
                    onChange={e => setFormData({...formData, courseId: e.target.value})}>
                      <option value="">Select Path...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-teal-600 text-white rounded-none font-black text-xs uppercase tracking-[0.4em] hover:bg-teal-500 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
                    {isSubmitting ? 'Synchronizing...' : 'Execute Submission'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="bg-white p-12 md:p-24 rounded-none shadow-[20px_20px_0px_rgba(0,0,0,0.05)] border border-slate-900">
              <div className="text-center mb-16">
                 <h2 className="text-4xl font-serif text-slate-900 mb-4 uppercase">Registry Audit</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] border-y border-slate-100 py-3 inline-block px-10">Institutional Access Only</p>
              </div>
              <form onSubmit={handleCheckStatus} className="space-y-10">
                <FormInput label="Registered Identifier (Email)" value={statusEmail} onChange={setStatusEmail} required />
                <FormInput label="Official Chronological Date (DOB)" type="date" value={statusDOB} onChange={setStatusDOB} required />
                <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-none font-black text-[11px] uppercase tracking-[0.4em] shadow-[10px_10px_0px_rgba(0,0,0,0.1)]">Verify Status</button>
              </form>
              {trackingResult !== null && (
                <div className="mt-20 p-12 bg-slate-50 border border-slate-900 text-center animate-scale-in relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-1 text-[9px] font-black uppercase tracking-widest">Verification Node Output</div>
                  {trackingResult === 'none' ? <p className="text-rose-700 font-black uppercase text-[11px] tracking-[0.2em]">Error: Entity not found.</p> : (
                    <div>
                      <span className="inline-block px-10 py-3 bg-teal-950 text-teal-400 border border-teal-800 rounded-none font-black text-[10px] uppercase tracking-[0.4em]">Status: {trackingResult.admissionStatus}</span>
                      <h4 className="text-4xl font-serif text-slate-900 mt-4 leading-tight">{trackingResult.firstName} {trackingResult.lastName}</h4>
                      {trackingResult.registrationNumber && <p className="text-teal-700 font-mono mt-2 font-bold">{trackingResult.registrationNumber}</p>}
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
