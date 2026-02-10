
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Student, UserProfile, Course, ClassroomParticipant, AttendanceLog, ChatMessage } from '../types.ts';
import { COURSES as STATIC_COURSES } from '../constants.ts';
import { useNavigate } from 'react-router-dom';
import { mockAuth, AuditReport } from '../services/authService.ts';
import { useLiveSession, VisualSettings } from '../components/LiveSessionContext.tsx';

const TuningSlider: React.FC<{ 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  onChange: (v: number) => void 
}> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-1.5" onPointerDown={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center px-1">
      <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">{label}</span>
      <span className="text-[7px] font-mono text-teal-400">{value}%</span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
    />
  </div>
);

const LiveToast: React.FC<{ message: string; onClear: () => void }> = ({ message, onClear }) => {
  useEffect(() => {
    const timer = setTimeout(onClear, 2000);
    return () => clearTimeout(timer);
  }, [message, onClear]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none animate-scale-in">
      <div className="px-8 py-4 bg-teal-950/90 backdrop-blur-xl rounded-full border border-teal-500/30 shadow-2xl">
        <span className="text-white font-black text-[9px] uppercase tracking-[0.3em] whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};

const ParticipantCard: React.FC<{ 
  participant: ClassroomParticipant; 
  onToggleMute: (id: string) => void;
  onToggleCamera: (id: string) => void;
  onBringToStage: (id: string) => void;
  onPromoteToMain?: (id: string) => void;
  isInstitutional: boolean;
  isMain?: boolean;
}> = ({ participant, onToggleMute, onToggleCamera, onBringToStage, onPromoteToMain, isInstitutional, isMain }) => {
  const isSpeaking = participant.isSpeaking && !participant.isMuted;

  return (
    <div className={`relative group bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${isMain ? 'ring-2 ring-teal-500 shadow-lg' : ''} ${participant.isHandRaised ? 'border-amber-500 ring-2 ring-amber-500/40 scale-[1.02] z-10' : isSpeaking ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-100 shadow-sm'}`}>
      <div className="aspect-video bg-slate-50 flex items-center justify-center relative overflow-hidden">
        {participant.isCameraOff ? (
          <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-black text-xs border border-teal-100">
            {participant.name[0]}
          </div>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-0.5">
              <div className={`w-1 h-1 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></div>
              <span className={`text-[6px] font-black uppercase tracking-tighter ${isSpeaking ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isSpeaking ? 'Speaking' : 'Live'}
              </span>
            </div>
          </div>
        )}
        
        <div className="absolute top-1.5 right-1.5 flex gap-1 items-center">
          {isSpeaking && (
            <div className="flex items-end gap-[1px] h-3 px-1.5 bg-emerald-50 rounded-md shadow-sm border border-emerald-400">
              <div className="w-[1.5px] bg-white animate-sound-bar [animation-delay:0.1s]"></div>
              <div className="w-[1.5px] bg-white animate-sound-bar [animation-delay:0.3s]"></div>
              <div className="w-[1.5px] bg-white animate-sound-bar [animation-delay:0.2s]"></div>
            </div>
          )}
          {participant.isHandRaised && (
            <div className="bg-amber-500 text-white p-1 rounded-md shadow-lg text-[10px] animate-bounce">✋</div>
          )}
        </div>

        {isInstitutional && (
          <div className="absolute inset-0 bg-teal-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <button onClick={() => onToggleMute(participant.id)} className={`p-2 rounded-md transition-all ${participant.isMuted ? 'bg-rose-600' : 'bg-white/10 hover:bg-white/20'} text-white`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2"/></svg>
            </button>
            {onPromoteToMain && (
              <button onClick={() => onPromoteToMain(participant.id)} className={`p-2 rounded-md transition-all ${isMain ? 'bg-teal-500' : 'bg-white/10 hover:bg-white/20'} text-white`} title="Swap Stage Role">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeWidth="2.5"/></svg>
              </button>
            )}
            <button onClick={() => onBringToStage(participant.id)} className="p-2 bg-amber-500 text-amber-950 rounded-md shadow-lg hover:bg-amber-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeWidth="2"/></svg>
            </button>
          </div>
        )}
      </div>
      <div className={`p-2 border-t transition-colors ${isSpeaking ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-50'}`}>
        <p className={`text-[8px] font-black truncate uppercase ${isSpeaking ? 'text-emerald-900' : 'text-slate-900'}`}>{participant.name}</p>
        <p className={`text-[6px] uppercase tracking-tighter font-black ${isSpeaking ? 'text-emerald-600' : 'text-slate-400'}`}>{participant.role}</p>
      </div>
    </div>
  );
};

const InstitutionalClassroom: React.FC<{ user: UserProfile | Student; activeCourse: Course }> = ({ user, activeCourse }) => {
  const { 
    isLive, sessionMode, activeStream, screenStream, mediaUrl, isMuted: broadcastMuted, isCameraOff: broadcastCameraOff, 
    broadcastMsg, isScreenShareSupported, isMobileDevice, isTorchOn, visuals, setVisuals,
    startCamera, cycleCamera, toggleTorch, startScreenShare, playMediaFile, terminateSession, 
    toggleMute: toggleBroadcastMute, toggleCamera: toggleBroadcastCamera, setBroadcastMsg 
  } = useLiveSession();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isTuningOpen, setIsTuningOpen] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const hudTimeoutRef = useRef<number | null>(null);

  // Auto-hide Control Logic
  const startHUDTimer = useCallback(() => {
    setShowHUD(true);
    if (hudTimeoutRef.current) window.clearTimeout(hudTimeoutRef.current);
    if (!isTuningOpen) {
      hudTimeoutRef.current = window.setTimeout(() => {
        setShowHUD(false);
      }, 3000);
    }
  }, [isTuningOpen]);

  useEffect(() => {
    startHUDTimer();
    return () => { if (hudTimeoutRef.current) window.clearTimeout(hudTimeoutRef.current); };
  }, [startHUDTimer]);

  const handleStageInteraction = () => {
    startHUDTimer();
  };

  const mainVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && activeStream && sessionMode === 'camera') node.srcObject = activeStream;
  }, [activeStream, sessionMode]);

  const mainScreenRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && screenStream && sessionMode === 'screen') node.srcObject = screenStream;
  }, [screenStream, sessionMode]);

  const pipVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && activeStream) node.srcObject = activeStream;
  }, [activeStream]);

  const pipScreenRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && screenStream) node.srcObject = screenStream;
  }, [screenStream]);
  
  const [mainStageId, setMainStageId] = useState<string>('inst-1');
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [pipPos, setPipPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localMuted, setLocalMuted] = useState(true);
  const [localCameraOff, setLocalCameraOff] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const tickerDuration = useMemo(() => {
    const len = broadcastMsg?.length || 0;
    return Math.max(3, len * 0.02);
  }, [broadcastMsg]);

  const filterStyle = useMemo(() => {
    const { brightness, contrast, saturation, blur, detail } = visuals;
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) contrast(${detail}%)`;
  }, [visuals]);
  
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([
    { id: 'inst-1', name: 'Ms. Mariam Bibi', role: 'instructor', isMuted: false, isCameraOff: false, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-1', name: 'Zoya Khan', role: 'student', isMuted: true, isCameraOff: true, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-2', name: 'Sadia Ahmed', role: 'student', isMuted: true, isCameraOff: false, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-3', name: 'Kiran Shah', role: 'student', isMuted: true, isCameraOff: false, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-4', name: 'Asma Bibi', role: 'student', isMuted: true, isCameraOff: false, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-5', name: 'Fatima Ali', role: 'student', isMuted: true, isCameraOff: true, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-6', name: 'Ayesha Khan', role: 'student', isMuted: true, isCameraOff: false, isHandRaised: false, isLive: true, isSpeaking: false },
  ]);

  const isInstitutional = user.role === 'admin' || user.role === 'instructor';

  const handleToggleMute = () => {
    if (isInstitutional) {
      toggleBroadcastMute();
      setToastMsg(broadcastMuted ? "MIC ACTIVATED" : "MIC MUTED");
    } else {
      const newState = !localMuted;
      setLocalMuted(newState);
      setParticipants(prev => prev.map(p => p.id === user.id ? { ...p, isMuted: newState } : p));
    }
  };

  const handleToggleCamera = () => {
    if (isInstitutional) {
      toggleBroadcastCamera();
      setToastMsg(broadcastCameraOff ? "CAMERA ON" : "CAMERA OFF");
    } else {
      const newState = !localCameraOff;
      setLocalCameraOff(newState);
      setParticipants(prev => prev.map(p => p.id === user.id ? { ...p, isCameraOff: newState } : p));
    }
  };

  const handleCycleCamera = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setToastMsg("RE-INITIALIZING CAMERA FEED...");
    await cycleCamera();
  };

  const handleToggleTorch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToastMsg(isTorchOn ? "ILLUMINATION OFF" : "ILLUMINATION ACTIVE");
    toggleTorch();
  };

  const promoteToMain = (id: string) => setMainStageId(id === mainStageId ? 'inst-1' : id);

  const handleSwapStage = () => {
    setToastMsg("TRANSITIONING VIEWS...");
    if (mainStageId !== 'inst-1') {
      // Return instructor to main stage, move student to PiP
      setSpotlightId(mainStageId);
      setMainStageId('inst-1');
    } else if (spotlightId) {
      // Move instructor to PiP, spotlighted student to main stage
      setMainStageId(spotlightId);
      setSpotlightId(null);
    }
  };

  const updateVisual = (key: keyof VisualSettings, val: number) => {
    setVisuals({ ...visuals, [key]: val });
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: isInstitutional ? 'instructor' : 'student',
      userName: `${user.firstName} ${user.lastName}`,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pipPos.x, y: e.clientY - pipPos.y });
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPipPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    startHUDTimer(); // Keep HUD visible during drag
  }, [isDragging, dragStart, startHUDTimer]);
  const onMouseUp = useCallback(() => setIsDragging(false), []);
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  const toggleParticipantMute = (id: string) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMuted: !p.isMuted } : p));
  const toggleParticipantCamera = (id: string) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, isCameraOff: !p.isCameraOff } : p));

  const currentMainParticipant = participants.find(p => p.id === mainStageId);

  return (
    <div className="flex flex-col bg-white overflow-hidden animate-scale-in">
      <div className="p-1 md:p-4 bg-slate-50 flex flex-col lg:flex-row gap-4">
        <div className="flex-grow relative">
          <div 
            ref={stageRef} 
            onMouseMove={handleStageInteraction}
            onTouchStart={handleStageInteraction}
            className="relative w-full aspect-video bg-black rounded-[1.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-[4px] md:border-[16px] border-slate-900 group cursor-default"
          >
            
            {toastMsg && <LiveToast message={toastMsg} onClear={() => setToastMsg(null)} />}

            {broadcastMsg && (
              <div className="absolute top-0 left-0 w-full bg-teal-900/60 backdrop-blur-md z-[70] h-6 md:h-8 flex items-center border-b border-white/5">
                <div className="flex-grow overflow-hidden relative h-full flex items-center">
                  <div className="animate-marquee whitespace-nowrap flex items-center" style={{ animationDuration: `${tickerDuration}s` }}>
                    <span className="text-[9px] md:text-xs font-bold text-teal-50 uppercase tracking-[0.2em] px-12">{broadcastMsg}</span>
                    <span className="text-[9px] md:text-xs font-bold text-teal-50 uppercase tracking-[0.2em] px-12">{broadcastMsg}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="w-full h-full relative flex items-center justify-center">
              {mainStageId !== 'inst-1' ? (
                <div className="w-full h-full bg-teal-950/20 flex flex-col items-center justify-center">
                   <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-teal-800/30 border-4 border-teal-500/20 flex items-center justify-center mb-6">
                      <span className="text-white text-4xl md:text-7xl font-serif">{currentMainParticipant?.name[0]}</span>
                   </div>
                   <h2 className="text-teal-400 font-serif text-2xl md:text-5xl mb-2">{currentMainParticipant?.name}</h2>
                   <p className="text-teal-500 font-black uppercase tracking-[0.5em] text-[10px]">Active Presentation Stage</p>
                </div>
              ) : !isLive ? (
                <div className="flex flex-col items-center gap-4 animate-fade-in text-center px-6">
                  <div className="w-12 h-12 bg-teal-900/40 rounded-xl flex items-center justify-center text-teal-400 border border-teal-500/10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="1.5"/></svg>
                  </div>
                  <button onClick={() => startCamera()} className="px-8 py-3 bg-teal-700 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all">Initialize Academic Stage</button>
                  {isMobileDevice && <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-2">Mobile View Active</p>}
                </div>
              ) : (
                <div className="w-full h-full relative overflow-hidden bg-slate-950">
                  {sessionMode === 'camera' && (
                    <video 
                      ref={mainVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      style={{ filter: filterStyle }}
                      className={`w-full h-full object-cover transition-all duration-700 ${broadcastCameraOff ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`} 
                    />
                  )}
                  {sessionMode === 'screen' && <video ref={mainScreenRef} autoPlay playsInline muted className="w-full h-full object-contain" />}
                  {sessionMode === 'media' && mediaUrl && <video src={mediaUrl} autoPlay controls className="w-full h-full object-contain" />}
                  
                  {/* FLOATING HARDWARE HUD - AUTO HIDES */}
                  {isInstitutional && sessionMode === 'camera' && !broadcastCameraOff && (
                    <div className={`transition-all duration-700 pointer-events-none ${showHUD ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                       <div className="absolute top-10 md:top-14 left-6 md:left-10 flex flex-col gap-3 z-[100] animate-fade-in pointer-events-auto">
                          <button onClick={handleCycleCamera} className="w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-teal-500 transition-all shadow-xl" title="Switch Camera Source">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4h5l2 2h5l2-2h5v7M3 20v-7h21v7a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeWidth="2.5"/><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeWidth="2"/></svg>
                          </button>
                          <button onClick={handleToggleTorch} className={`w-10 h-10 md:w-12 md:h-12 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center transition-all shadow-xl ${isTorchOn ? 'bg-yellow-400 text-black' : 'bg-black/40 text-yellow-400 hover:bg-black/60'}`} title="Physical Torch">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 11c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/></svg>
                          </button>
                       </div>

                       <div className="absolute right-6 md:right-10 top-10 md:top-14 z-[100] animate-fade-in pointer-events-auto">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsTuningOpen(!isTuningOpen); }} 
                            className={`p-3 md:p-4 backdrop-blur-md rounded-2xl border transition-all shadow-2xl ${isTuningOpen ? 'bg-teal-500 border-white text-teal-950 scale-110' : 'bg-black/40 border-white/20 text-white hover:bg-black/60'}`}
                          >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m10 0a2 2 0 100-4m0 4a2 2 0 110-4M6 20v-2m0 0V12m0 6h12m0-6v2m0-2V4" strokeWidth="2.5"/></svg>
                          </button>
                       </div>

                       {isTuningOpen && (
                         <div 
                            onPointerDown={(e) => e.stopPropagation()}
                            className="absolute right-6 md:right-10 top-28 md:top-36 w-48 md:w-56 bg-black/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 z-[110] animate-scale-in space-y-6 pointer-events-auto"
                         >
                            <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-3">Imaging Core</h4>
                            <TuningSlider label="Exposure" value={visuals.brightness} min={50} max={200} onChange={v => updateVisual('brightness', v)} />
                            <TuningSlider label="Dynamics" value={visuals.contrast} min={50} max={200} onChange={v => updateVisual('contrast', v)} />
                            <TuningSlider label="Intensity" value={visuals.saturation} min={0} max={200} onChange={v => updateVisual('saturation', v)} />
                            <TuningSlider label="Blur Filter" value={visuals.blur} min={0} max={20} onChange={v => updateVisual('blur', v)} />
                            <TuningSlider label="Detail Pin" value={visuals.detail} min={80} max={180} onChange={v => updateVisual('detail', v)} />
                            <button 
                              onClick={() => setVisuals({ brightness: 100, contrast: 100, saturation: 100, blur: 0, detail: 100 })}
                              className="w-full py-2.5 bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                            >
                              Default Profile
                            </button>
                         </div>
                       )}
                    </div>
                  )}

                  {broadcastCameraOff && sessionMode === 'camera' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-950/20 text-teal-400">
                      <div className="w-20 h-20 bg-teal-900 rounded-full flex items-center justify-center font-serif text-3xl mb-4 shadow-2xl border border-teal-500/10">M</div>
                      <p className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-4 py-1.5 rounded-full">Feed Disabled</p>
                    </div>
                  )}
                </div>
              )}

              {/* SPOTLIGHT OVERLAY - Click to Swap logic & Responsive Geometry */}
              {(spotlightId || mainStageId !== 'inst-1') && (
                <div 
                  onMouseDown={onMouseDown} 
                  onClick={handleSwapStage}
                  style={{ transform: `translate(${pipPos.x}px, ${pipPos.y}px)` }} 
                  className={`absolute bottom-6 right-6 w-[32%] md:w-[18%] aspect-video bg-slate-900 rounded-xl md:rounded-[2.5rem] border-2 border-teal-500 shadow-2xl overflow-hidden animate-scale-in z-[80] cursor-pointer hover:ring-4 hover:ring-white/20 transition-all group`}
                >
                  <div className="w-full h-full flex items-center justify-center relative bg-black select-none pointer-events-none">
                    {mainStageId !== 'inst-1' ? (
                      <div className="w-full h-full relative">
                        {sessionMode === 'camera' && <video ref={pipVideoRef} autoPlay playsInline muted style={{ filter: filterStyle }} className={`w-full h-full object-cover transition-opacity ${broadcastCameraOff ? 'opacity-0' : 'opacity-100'}`} />}
                        {sessionMode === 'screen' && <video ref={pipScreenRef} autoPlay playsInline muted className="w-full h-full object-contain" />}
                        {sessionMode === 'media' && mediaUrl && <video src={mediaUrl} autoPlay muted className="w-full h-full object-cover" />}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-teal-900/20 flex items-center justify-center">
                         <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-teal-400">Student Feed</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-teal-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeWidth="3"/></svg>
                       </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-1 md:p-2 backdrop-blur-md bg-black/60 pointer-events-none">
                      <p className="text-[6px] md:text-[8px] font-black text-white uppercase truncate text-center">
                        {mainStageId !== 'inst-1' ? 'Instructor (Mariam Bibi)' : participants.find(p => p.id === spotlightId)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom HUD - Command Bar - AUTO HIDES */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-700 pointer-events-auto z-[90] ${showHUD ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-xl max-w-[95vw]">
                {isLive && (
                  <>
                    <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-2.5 rounded-xl transition-all ${isChatOpen ? 'bg-blue-600 text-white' : 'text-blue-500 hover:bg-white/10'}`} title="Class Chat"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeWidth="2.5"/></svg></button>
                    
                    {isInstitutional && (
                      <>
                        <div className="relative group/btn">
                          <button 
                            onClick={startScreenShare} 
                            disabled={!isScreenShareSupported}
                            className={`p-2.5 rounded-xl transition-all ${sessionMode === 'screen' ? 'bg-teal-600 text-white' : isScreenShareSupported ? 'text-teal-500 hover:bg-white/10' : 'text-slate-600 cursor-not-allowed opacity-50'}`} 
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2.5"/></svg>
                          </button>
                          {!isScreenShareSupported && (
                            <div className="absolute bottom-full right-0 mb-2 w-40 p-2 bg-black text-[7px] text-white font-black uppercase tracking-tighter rounded-lg opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity text-center">
                              Note: Multi-screen requires a Desktop station.
                            </div>
                          )}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className={`p-2.5 rounded-xl transition-all ${sessionMode === 'media' ? 'bg-amber-600 text-white' : 'text-amber-500 hover:bg-white/10'}`} title="Broadcast Media"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeWidth="2.5"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg></button>
                        <input type="file" min="1" max="1" ref={fileInputRef} className="hidden" accept="video/*" onChange={(e) => e.target.files?.[0] && playMediaFile(e.target.files[0])} />
                      </>
                    )}
                    
                    <button onClick={handleToggleCamera} className={`p-2.5 rounded-xl transition-all ${(isInstitutional ? broadcastCameraOff : localCameraOff) ? 'bg-rose-600 text-white' : 'text-rose-500 hover:bg-white/10'}`} title={isInstitutional ? "Broadcast Camera" : "Local Camera"}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2.5"/></svg></button>
                    <button onClick={handleToggleMute} className={`p-2.5 rounded-xl transition-all ${(isInstitutional ? broadcastMuted : localMuted) ? 'bg-rose-600 text-white' : 'text-rose-500 hover:bg-white/10'}`} title={isInstitutional ? "Broadcast Mic" : "Local Mic"}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{(isInstitutional ? broadcastMuted : localMuted) ? <path d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v3.38l3 3V5c0-1.657 1.343-3 3-3s3 1.343 3 3v12.38l-2.447 2.447a1 1 0 01-1.414 0l-16-16a1 1 0 011.414-1.414l1.586 1.586V10" strokeWidth="3"/> : <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2.5"/>}</svg></button>
                    
                    {isInstitutional && (
                      <button onClick={terminateSession} className="p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all" title="Terminate Broadcast"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button>
                    )}
                  </>
                )}
                <button onClick={() => stageRef.current && (document.fullscreenElement ? document.exitFullscreen() : stageRef.current.requestFullscreen())} className="p-2.5 rounded-xl text-teal-500/40 hover:bg-white/10 hover:text-teal-400 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeWidth="2.5"/></svg></button>
              </div>
            </div>
          </div>
        </div>

        {isChatOpen && (
          <div className="w-full lg:w-80 flex flex-col bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden animate-scale-in h-[400px] lg:h-auto">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest">Classroom Chat</span></div><button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button></div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">{messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center px-4"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No messages yet.</p></div> : messages.map(m => <div key={m.id} className={`flex flex-col ${m.userName.includes(user.firstName) ? 'items-end' : 'items-start'}`}><div className="flex items-center gap-2 mb-1"><span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{m.userName}</span><span className="text-[7px] text-slate-300">{m.timestamp}</span></div><div className={`px-4 py-2 rounded-2xl text-[11px] max-w-[90%] shadow-sm ${m.userName.includes(user.firstName) ? 'bg-teal-700 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>{m.text}</div></div>)}<div ref={chatEndRef} /></div>
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 bg-white flex gap-2"><input type="text" placeholder="Say something..." className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:border-teal-500 transition-all" value={chatInput} onChange={(e) => setChatInput(e.target.value)} /><button type="submit" className="p-4 bg-teal-700 text-white rounded-xl shadow-lg hover:bg-teal-600 active:scale-95 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2.5"/></svg></button></form>
          </div>
        )}
      </div>

      <div className="bg-white p-6 md:p-10">
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
          {participants.map(p => (
            <ParticipantCard 
              key={p.id} 
              participant={p} 
              isInstitutional={isInstitutional} 
              isMain={mainStageId === p.id}
              onToggleMute={toggleParticipantMute} 
              onToggleCamera={toggleParticipantCamera} 
              onPromoteToMain={isInstitutional ? promoteToMain : undefined}
              onBringToStage={(id) => setSpotlightId(id === spotlightId ? null : id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const RegistryPanel: React.FC<{ user: UserProfile | Student }> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'attendance'>('applications');
  const [pendingApps, setPendingApps] = useState<Student[]>([]);
  useEffect(() => {
    mockAuth.getPendingApplications().then(setPendingApps);
  }, []);
  const handleAction = async (app: Student, type: 'approve' | 'reject') => {
    if (type === 'approve') await mockAuth.approveApplication(app);
    else await mockAuth.rejectApplication(app);
    setPendingApps(prev => prev.filter(a => a.id !== app.id));
  };
  return (
    <div className="animate-fade-in p-6 md:p-10 space-y-10">
      <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-fit"><button onClick={() => setActiveSubTab('applications')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'applications' ? 'bg-white text-teal-700 shadow-md' : 'text-slate-50'}`}>Admissions Queue</button></div>
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">{activeSubTab === 'applications' && <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Candidate</th><th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Trade Path</th><th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th><th className="p-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Actions</th></tr></thead><tbody className="divide-y divide-slate-50">{pendingApps.length === 0 ? <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-serif italic text-lg">No pending files.</td></tr> : pendingApps.map(app => <tr key={app.id} className="hover:bg-slate-50/50 transition-colors"><td className="p-5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xs">{app.firstName[0]}</div><div><p className="text-[11px] font-bold text-slate-900 leading-none mb-1">{app.firstName} {app.lastName}</p><p className="text-[9px] text-slate-400 leading-none">{app.email}</p></div></div></td><td className="p-5 text-[10px] font-medium text-slate-600">{app.courseId}</td><td className="p-5 text-[10px] text-slate-400 font-mono">{new Date(app.applicationDate).toLocaleDateString()}</td><td className="p-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleAction(app, 'approve')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Verify</button><button onClick={() => handleAction(app, 'reject')} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Archive</button></div></td></tr>)}</tbody></table></div>}</div>
    </div>
  );
};

const ManagementPanel: React.FC<{ user: UserProfile | Student }> = ({ user }) => {
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    mockAuth.getSystemAudit().then(setAudit);
    mockAuth.getCourses().then(setCourses);
  }, []);
  const toggleCourseStatus = async (course: Course) => {
    const updated = { ...course, status: course.status === 'active' ? 'frozen' : 'active' } as Course;
    await mockAuth.saveCourse(updated);
    mockAuth.getCourses().then(setCourses);
  };
  return (
    <div className="animate-fade-in p-6 md:p-10 space-y-10">
      {audit && <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{[{ label: 'Students', val: audit.counts.enrolled, color: 'text-teal-600' }, { label: 'Staff', val: audit.counts.staff, color: 'text-amber-600' }, { label: 'Trades', val: audit.counts.courses, color: 'text-blue-600' }, { label: 'Health', val: `${audit.healthScore}%`, color: 'text-emerald-600' }].map((stat, i) => <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p><p className={`text-3xl font-serif ${stat.color}`}>{stat.val}</p></div>)}</div>}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 min-h-[500px]"><h4 className="text-xl font-serif text-slate-900 mb-6">Trade Registry Control</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{courses.map(course => <div key={course.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center"><div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${course.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div><div><p className="text-xs font-black text-slate-900 uppercase tracking-tight">{course.title}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.duration}</p></div></div><button onClick={() => toggleCourseStatus(course)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${course.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600'} hover:text-white`}>{course.status === 'active' ? 'Freeze' : 'Activate'}</button></div>)}</div></div>
    </div>
  );
};

const LMS: React.FC<{ externalUser: (UserProfile | Student) | null; onAuthUpdate: (u: (UserProfile | Student) | null) => void }> = ({ externalUser, onAuthUpdate }) => {
  const [activeTab, setActiveTab] = useState('classroom');
  const navigate = useNavigate();

  useEffect(() => {
    if (!externalUser) navigate('/#portal-hub');
  }, [externalUser, navigate]);

  if (!externalUser) return null;
  const isInstitutional = externalUser.role === 'admin' || externalUser.role === 'instructor';
  const isAdminOnly = externalUser.role === 'admin';

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1900px] mx-auto px-4 py-8 md:py-12">
        <header className="bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center gap-6 mb-6">
          <div className="flex items-center gap-4"><div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md relative">{externalUser.firstName[0]}<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div></div><div><h1 className="text-sm md:text-lg font-serif text-slate-900 leading-none">{externalUser.firstName} {externalUser.lastName}</h1><p className="text-[7px] font-black text-teal-700 uppercase tracking-widest mt-1">{externalUser.role} Auth Session</p></div></div>
          <button onClick={() => onAuthUpdate(null)} className="px-5 py-2 bg-white text-rose-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-50 hover:bg-rose-600 hover:text-white transition-all shadow-sm">Sign Out</button>
        </header>
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('classroom')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeTab === 'classroom' ? 'bg-teal-700 text-white border-teal-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}>Academic Stage</button>
          {isInstitutional && <button onClick={() => setActiveTab('registry')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeTab === 'registry' ? 'bg-amber-600 text-white border-amber-500 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}>Institutional Registry</button>}
          {isAdminOnly && <button onClick={() => setActiveTab('management')} className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeTab === 'management' ? 'bg-slate-900 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}>System Management</button>}
        </div>
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[70vh]">
          {activeTab === 'classroom' && <InstitutionalClassroom user={externalUser} activeCourse={STATIC_COURSES[0]} />}
          {activeTab === 'registry' && <RegistryPanel user={externalUser} />}
          {activeTab === 'management' && <ManagementPanel user={externalUser} />}
        </div>
      </div>
    </div>
  );
};

export default LMS;
