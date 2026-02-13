
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Student, UserProfile, Course, ClassroomParticipant, ChatMessage } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { mockAuth } from '../services/authService.ts';
import { useLiveSession } from '../components/LiveSessionContext.tsx';

const ChatRoom: React.FC<{ user: UserProfile | Student }> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: user.role === 'admin' ? 'instructor' : 'student',
      text: input,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl flex flex-col h-[400px] xl:h-full overflow-hidden">
      <div className="p-4 md:p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Live Discourse</span>
        <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div></div>
      </div>
      <div ref={scrollRef} className="flex-grow p-5 md:p-6 overflow-y-auto space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.userName === `${user.firstName} ${user.lastName}` ? 'items-end' : 'items-start'}`}>
            <div className={`px-3.5 py-2 rounded-2xl text-[10px] md:text-[11px] shadow-sm ${msg.role === 'instructor' ? 'bg-teal-900 text-teal-50' : 'bg-slate-100 text-slate-600'}`}>
              {msg.text}
            </div>
            <span className="text-[6px] md:text-[7px] font-black text-slate-300 mt-1 uppercase tracking-tighter">{msg.userName} • {msg.timestamp}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 md:p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message group..." className="flex-grow bg-white border-none rounded-xl px-4 py-2.5 md:py-3 text-xs outline-none shadow-inner" />
        <button type="submit" className="p-2.5 md:p-3 bg-teal-800 text-white rounded-xl shadow-lg hover:bg-teal-950 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3"/></svg>
        </button>
      </form>
    </div>
  );
};

const MicroParticipantCard: React.FC<{ 
  participant: ClassroomParticipant; 
  isAdmin: boolean;
  onSpotlight?: (id: string) => void;
  onMute?: (id: string) => void;
  onCam?: (id: string) => void;
}> = ({ participant, isAdmin, onSpotlight, onMute, onCam }) => (
  <div className={`group relative bg-white border rounded-2xl p-2.5 md:p-3 flex items-center gap-3 transition-all hover:shadow-md ${participant.isHandRaised ? 'border-amber-400 bg-amber-50/50' : 'border-slate-100'}`}>
    <div className="relative flex-shrink-0">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black overflow-hidden border border-slate-200">
        {participant.avatar ? <img src={participant.avatar} className="w-full h-full object-cover" /> : participant.name[0]}
      </div>
      {participant.isSpeaking && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"><div className="w-0.5 md:w-1 h-2 bg-teal-500 animate-sound-bar"></div><div className="w-0.5 md:w-1 h-3 bg-teal-500 animate-sound-bar [animation-delay:0.1s]"></div></div>}
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-[9px] md:text-[10px] font-black text-slate-800 truncate uppercase">{participant.name}</p>
      <div className="flex gap-2">
         {participant.isMuted && <svg className="w-2 md:w-2.5 h-2 md:h-2.5 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" /></svg>}
         {participant.isCameraOff && <svg className="w-2 md:w-2.5 h-2 md:h-2.5 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
      </div>
    </div>
    {isAdmin && (
      <div className="absolute inset-0 bg-slate-900/90 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 md:gap-2 transition-opacity px-1 md:px-2">
        <button onClick={() => onSpotlight?.(participant.id)} className="p-1.5 md:p-2 text-teal-400 hover:text-white" title="Spotlight Guest"><svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2.5"/></svg></button>
        <button onClick={() => onMute?.(participant.id)} className={`p-1.5 md:p-2 ${participant.isMuted ? 'text-rose-400' : 'text-white/60 hover:text-rose-400'}`} title="Toggle Remote Mic"><svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2.5"/></svg></button>
        <button onClick={() => onCam?.(participant.id)} className={`p-1.5 md:p-2 ${participant.isCameraOff ? 'text-rose-400' : 'text-white/60 hover:text-rose-400'}`} title="Toggle Remote Cam"><svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2.5"/></svg></button>
      </div>
    )}
  </div>
);

const InstitutionalClassroom: React.FC<{ user: UserProfile | Student }> = ({ user }) => {
  const { 
    sessionMode, activeStream, screenStream, mediaUrl, 
    isMuted, isCameraOff, isTorchOn, 
    startCamera, cycleCamera, toggleTorch, startScreenShare, playMediaFile, terminateSession, 
    toggleMute, toggleCamera 
  } = useLiveSession();
  
  const [showHUD, setShowHUD] = useState(true);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [swapped, setSwapped] = useState(false);
  const [guestMediaStream, setGuestMediaStream] = useState<MediaStream | null>(null);
  
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([
    { id: 'instr-01', name: 'Instructor', role: 'instructor', isMuted: false, isCameraOff: false, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-1', name: 'Sana Fatima', role: 'student', isMuted: true, isCameraOff: true, isHandRaised: false, isLive: true, isSpeaking: false },
    { id: 'std-2', name: 'Zoya Ahmed', role: 'student', isMuted: false, isCameraOff: false, isHandRaised: false, isLive: true, isSpeaking: true },
  ]);

  const hudTimer = useRef<number | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const guestVideoRef = useRef<HTMLVideoElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user.role === 'admin';

  const resetHUDTimer = useCallback(() => {
    setShowHUD(true);
    if (hudTimer.current) window.clearTimeout(hudTimer.current);
    hudTimer.current = window.setTimeout(() => setShowHUD(false), 4000);
  }, []);

  // Simplified Stream Assignment with Swapping Logic
  useEffect(() => {
    const instructorStream = screenStream || activeStream;
    const studentStream = guestMediaStream;

    const mainEl = mainVideoRef.current;
    const guestEl = guestVideoRef.current;

    if (mainEl) {
      mainEl.srcObject = swapped ? studentStream : instructorStream;
    }
    
    if (guestEl) {
      guestEl.srcObject = swapped ? instructorStream : studentStream;
    }
  }, [activeStream, screenStream, guestMediaStream, swapped, sessionMode]);

  const handleSpotlight = (id: string) => { 
    if (spotlightId === id) {
      setSpotlightId(null); 
      setGuestMediaStream(null);
      setSwapped(false); 
    } else {
      setSpotlightId(id);
      // Simulating a P2P stream acquisition from the peer
      // In a real environment, we'd assign the actual peer media stream here
      // For demo purposes, we clone the instructor stream if present or use null
      if (activeStream) setGuestMediaStream(activeStream.clone());
    }
  };

  const handleToggleMute = (id: string) => setParticipants(p => p.map(x => x.id === id ? {...x, isMuted: !x.isMuted} : x));
  const handleToggleCam = (id: string) => setParticipants(p => p.map(x => x.id === id ? {...x, isCameraOff: !x.isCameraOff} : x));
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) playMediaFile(file);
  };

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 md:gap-8 p-3 md:p-8 xl:p-10 animate-fade-in bg-slate-50" onMouseMove={resetHUDTimer} onClick={resetHUDTimer}>
      <div className="flex-grow space-y-8 md:space-y-10">
        
        {/* Stage Component - Visual Hub */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] group border-4 md:border-8 border-white">
          {sessionMode !== 'media' && (activeStream || screenStream || guestMediaStream) ? (
            <video ref={mainVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : sessionMode !== 'media' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
               <div className="w-20 md:w-32 h-20 md:h-32 border-2 border-teal-500 rounded-full animate-ping"></div>
               <p className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] md:tracking-[1em] mt-6 md:mt-10">Awaiting Signal</p>
            </div>
          )}

          {/* Actual Media Element for File Broadcast */}
          {sessionMode === 'media' && mediaUrl && (
            <video src={mediaUrl} autoPlay className="w-full h-full object-contain" />
          )}

          {/* Spotlight Window (PiP) - Dynamic Sizing & Interaction */}
          {spotlightId && (
            <div 
              onClick={() => isAdmin && setSwapped(!swapped)}
              className={`absolute top-4 right-4 md:top-6 md:right-6 w-1/3 md:w-1/5 aspect-video bg-slate-900 rounded-xl md:rounded-3xl border md:border-2 border-white/20 shadow-2xl overflow-hidden z-40 transition-all cursor-pointer hover:scale-105 active:scale-95 ${swapped ? 'ring-2 md:ring-4 ring-teal-500 shadow-teal-500/20' : ''}`}
            >
              <div className="w-full h-full relative bg-slate-800">
                <video ref={guestVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                
                {/* Visual Label to explain what is being seen */}
                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 md:p-2 backdrop-blur-sm">
                  <p className="text-[6px] md:text-[8px] font-black text-white/70 uppercase tracking-widest text-center truncate">
                    {swapped ? 'Instructor (PiP)' : `Student: ${participants.find(p => p.id === spotlightId)?.name}`}
                  </p>
                </div>

                {isAdmin && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pip:opacity-100 bg-teal-900/40 transition-opacity">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeWidth="2.5"/></svg>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Institutional HUD - Single Row Row Controls */}
          <div 
            className={`absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center flex-nowrap gap-0.5 md:gap-2 p-1 md:p-1.5 bg-slate-900/60 backdrop-blur-3xl rounded-full border border-white/10 transition-all duration-700 z-[50] max-w-[96%] overflow-x-hidden ${showHUD ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 md:translate-y-10 pointer-events-none'}`}
          >
            <button onClick={() => toggleMute()} className={`p-2 sm:p-2.5 md:p-4 rounded-full transition-all flex-shrink-0 ${isMuted ? 'bg-rose-500 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2.5"/></svg>
            </button>
            <button onClick={() => toggleCamera()} className={`p-2 sm:p-2.5 md:p-4 rounded-full transition-all flex-shrink-0 ${isCameraOff ? 'bg-rose-500 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2.5"/></svg>
            </button>
            
            <div className="w-px h-4 md:h-6 bg-white/10 mx-0.5 md:mx-1 flex-shrink-0"></div>
            
            <button onClick={() => cycleCamera()} className="p-2 sm:p-2.5 md:p-4 text-white/60 hover:text-white rounded-full transition-all flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5"/></svg>
            </button>
            <button onClick={() => toggleTorch()} className={`p-2 sm:p-2.5 md:p-4 rounded-full transition-all flex-shrink-0 ${isTorchOn ? 'bg-amber-400 text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5"/></svg>
            </button>

            {isAdmin && (
              <>
                <div className="w-px h-4 md:h-6 bg-white/10 mx-0.5 md:mx-1 flex-shrink-0"></div>
                <button onClick={() => startCamera()} className={`p-2 sm:p-2.5 md:p-4 rounded-full transition-all flex-shrink-0 ${sessionMode === 'camera' ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-white/60 hover:text-teal-400'}`} title="Cam Share"><svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2.5"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/></svg></button>
                <button onClick={() => startScreenShare()} className={`p-2 sm:p-2.5 md:p-4 rounded-full transition-all flex-shrink-0 ${sessionMode === 'screen' ? 'bg-blue-500 text-slate-900 shadow-lg' : 'text-white/60 hover:text-blue-400'}`} title="Screen Share"><svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2.5"/></svg></button>
                <button onClick={() => mediaInputRef.current?.click()} className={`p-2 sm:p-2.5 md:p-4 rounded-full transition-all flex-shrink-0 ${sessionMode === 'media' ? 'bg-purple-500 text-slate-900 shadow-lg' : 'text-white/60 hover:text-purple-400'}`} title="Media Broadcast"><svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" strokeWidth="2.5"/></svg></button>
                <input ref={mediaInputRef} type="file" className="hidden" accept="video/*" onChange={handleFileSelect} />
                <div className="w-px h-4 md:h-6 bg-white/10 mx-0.5 md:mx-1 flex-shrink-0"></div>
                <button onClick={() => terminateSession()} className="p-2 sm:p-2.5 md:p-4 bg-rose-500/20 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all flex-shrink-0"><svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button>
              </>
            )}
          </div>
        </div>

        {/* Media Controls Row - Positioned Below the Stage */}
        {sessionMode === 'media' && mediaUrl && (
          <div className="w-full bg-slate-900 p-3 rounded-3xl border border-slate-800 shadow-lg animate-fade-in">
            <video 
              src={mediaUrl} 
              controls 
              className="w-full h-12 bg-transparent overflow-hidden" 
              style={{ filter: 'invert(1) hue-rotate(180deg) contrast(1.5)' }} // Simple way to skin the native bar dark
            />
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center mt-2">Active Institutional Broadcast Controller</p>
          </div>
        )}

        {/* Unified Cohort View */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4 md:px-6">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Cohort • {participants.length} Active</span>
            {isAdmin && <button className="text-[8px] md:text-[9px] font-black text-teal-700 uppercase tracking-widest bg-teal-50 px-3 md:px-4 py-1.5 rounded-full">Discipline All</button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 px-2">
            {participants.map(p => (
              <MicroParticipantCard 
                key={p.id} participant={p} isAdmin={isAdmin} 
                onSpotlight={handleSpotlight} onMute={handleToggleMute} onCam={handleToggleCam} 
              />
            ))}
          </div>
        </div>
      </div>

      <aside className="w-full xl:w-[360px] 2xl:w-[400px] flex-shrink-0">
        <ChatRoom user={user} />
      </aside>
    </div>
  );
};

const LMS: React.FC<{ externalUser: (UserProfile | Student) | null; onAuthUpdate: (u: (UserProfile | Student) | null) => void }> = ({ externalUser, onAuthUpdate }) => {
  const [activeTab, setActiveTab] = useState('classroom');
  const navigate = useNavigate();
  const { terminateSession } = useLiveSession();

  useEffect(() => { 
    if (!externalUser) {
      terminateSession();
      navigate('/#portal-hub'); 
    }
  }, [externalUser, navigate, terminateSession]);

  if (!externalUser) return null;

  const handleSignOut = () => {
    terminateSession();
    onAuthUpdate(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1900px] mx-auto px-3 md:px-4 py-6">
        <header className="bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 md:mb-8 no-print">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-800 text-teal-100 rounded-2xl flex items-center justify-center font-black shadow-lg">{externalUser.firstName[0]}</div>
            <div>
              <h1 className="text-sm md:text-xl font-serif text-slate-900 leading-none">{externalUser.firstName} {externalUser.lastName}</h1>
              <p className="text-[7px] md:text-[8px] font-black text-teal-600 uppercase tracking-[0.2em] mt-1 md:mt-1.5">{externalUser.role} Node</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
             <div className="flex gap-1 md:gap-2">
                <button onClick={() => setActiveTab('classroom')} className={`px-4 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'classroom' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>Classroom</button>
                {externalUser.role === 'admin' && <button onClick={() => setActiveTab('registry')} className={`px-4 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'registry' ? 'bg-amber-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>Registry</button>}
             </div>
             <button onClick={handleSignOut} className="px-4 md:px-6 py-2 md:py-3 bg-rose-50 text-rose-600 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Exit</button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-[0_60px_100px_-40px_rgba(0,0,0,0.1)] overflow-hidden min-h-[80vh]">
          {activeTab === 'classroom' ? <InstitutionalClassroom user={externalUser} /> : <RegistryPanel />}
        </div>
      </div>
    </div>
  );
};

const CourseManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id'>>({
    title: '', description: '', category: 'Vocational', duration: '6 Months', image: '', status: 'active'
  });

  const load = () => mockAuth.getCourses().then(setCourses);
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await mockAuth.updateCourse(editingId, form);
    else await mockAuth.createCourse(form);
    setIsAdding(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Expunge specialization?")) {
      await mockAuth.deleteCourse(id);
      load();
    }
  };

  return (
    <div className="p-6 md:p-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
        <h3 className="text-2xl md:text-3xl font-serif text-slate-900">Curriculum Registry</h3>
        <button onClick={() => setIsAdding(true)} className="w-full sm:w-auto px-8 py-3 bg-teal-800 text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">Define New Subject</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(c => (
          <div key={c.id} className="bg-slate-50 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-2xl">
            <div className="h-32 md:h-40 bg-slate-200 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 md:mb-6"><img src={c.image} className="w-full h-full object-cover" /></div>
            <h4 className="text-lg md:text-xl font-serif text-slate-900 mb-2">{c.title}</h4>
            <div className="flex justify-between mb-4 md:mb-6">
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white rounded-full border">{c.category}</span>
              <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{c.status}</span>
            </div>
            <div className="flex gap-4 border-t border-slate-200 pt-4 md:pt-6">
               <button onClick={() => { setEditingId(c.id); setForm(c); setIsAdding(true); }} className="text-[8px] md:text-[9px] font-black uppercase text-teal-700 hover:underline">Edit</button>
               <button onClick={() => handleDelete(c.id)} className="text-[8px] md:text-[9px] font-black uppercase text-rose-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {isAdding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleSave} className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] w-full max-w-xl space-y-4 md:space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h4 className="text-2xl md:text-3xl font-serif text-slate-900 mb-2">Academic Protocol</h4>
            <div className="space-y-3 md:space-y-4">
              <input required placeholder="Subject Title" className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <textarea placeholder="Academic Description" className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl h-24 md:h-32 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select className="p-4 md:p-5 bg-slate-50 rounded-2xl border-none" value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
                  <option>Vocational</option><option>Technical</option><option>Creative</option><option>Professional</option>
                </select>
                <select className="p-4 md:p-5 bg-slate-50 rounded-2xl border-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                  <option value="active">Active</option><option value="scheduled">Scheduled</option><option value="frozen">Frozen</option>
                </select>
              </div>
              <input placeholder="Duration" className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
              <input placeholder="Image Resource URL" className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6">
              <button type="submit" className="flex-grow py-4 md:py-5 bg-teal-800 text-white rounded-[2rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl">Commit Record</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 md:px-10 py-4 md:py-5 bg-slate-100 text-slate-400 rounded-[2rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const RegistryPanel: React.FC = () => {
  const [pending, setPending] = useState<Student[]>([]);
  const [activeSub, setActiveSub] = useState<'applications' | 'courses'>('applications');
  useEffect(() => { mockAuth.getPendingApplications().then(setPending); }, []);
  const handleVerify = async (s: Student) => { await mockAuth.approveApplication(s); setPending(prev => prev.filter(p => p.id !== s.id)); };

  return (
    <div className="p-6 md:p-10">
      <div className="flex gap-2 md:gap-4 mb-8 md:mb-12 bg-slate-50 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2rem] w-fit border border-slate-100">
        <button onClick={() => setActiveSub('applications')} className={`px-6 md:px-10 py-2.5 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeSub === 'applications' ? 'bg-white text-teal-800 shadow-xl' : 'text-slate-400'}`}>Candidates</button>
        <button onClick={() => setActiveSub('courses')} className={`px-6 md:px-10 py-2.5 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeSub === 'courses' ? 'bg-white text-teal-800 shadow-xl' : 'text-slate-400'}`}>Curriculum</button>
      </div>
      {activeSub === 'applications' ? (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                  <th className="p-4 md:p-6 text-right text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pending.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 md:p-6">
                      <p className="text-[11px] md:text-[12px] font-bold text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-mono">{s.email}</p>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <button onClick={() => handleVerify(s)} className="px-4 md:px-6 py-2 md:py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-[8px] md:text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100">Authorize</button>
                    </td>
                  </tr>
                ))}
                {pending.length === 0 && <tr><td colSpan={2} className="p-12 md:p-20 text-center text-slate-300 font-serif italic text-lg md:text-xl">Registry queue is empty.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : <CourseManager />}
    </div>
  );
};

export default LMS;
