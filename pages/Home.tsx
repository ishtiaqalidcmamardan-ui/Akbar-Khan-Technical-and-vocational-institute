
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EXECUTIVE_MESSAGES, COURSES as STATIC_COURSES, BOUTIQUE_PRODUCTS, GALLERY_ASSETS } from '../constants.ts';
import { EditableText } from '../components/EditableText.tsx';
import { EditableImage } from '../components/EditableImage.tsx';
import { Student, UserProfile } from '../types.ts';
import { mockAuth } from '../services/authService.ts';
import { GoogleGenAI } from "@google/genai";
import { isSupabaseConfigured } from '../services/supabase.ts';

interface HomeProps {
  user: (UserProfile | Student) | null;
  onDemoLogin: (s: Student | UserProfile, redirect?: string) => void;
  onOpenAuth: (intendedPath?: string) => void;
}

const TickerSystem: React.FC<{ onJoin: () => void }> = ({ onJoin }) => {
  const [broadcastMsg, setBroadcastMsg] = useState(localStorage.getItem('ak_global_broadcast') || '');
  const [courseUpdates, setCourseUpdates] = useState<string[]>([]);
  const [liveCourseName, setLiveCourseName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      const courses = await mockAuth.getCourses();
      const updates: string[] = [];
      let activeCourse: string | null = null;
      courses.forEach(c => {
        if (c.status === 'active') {
          updates.push(`🔴 LIVE BROADCAST: ${c.title} session is currently in progress.`);
          if (!activeCourse) activeCourse = c.title;
        } else if (c.status === 'scheduled') {
          updates.push(`📅 ACADEMIC INTAKE: ${c.title} starting soon. Apply Now.`);
        }
      });
      setCourseUpdates(updates);
      setLiveCourseName(activeCourse);
    };
    fetchUpdates();
    const handleUpdate = () => setBroadcastMsg(localStorage.getItem('ak_global_broadcast') || '');
    window.addEventListener('ak_broadcast_updated', handleUpdate);
    return () => window.removeEventListener('ak_broadcast_updated', handleUpdate);
  }, []);

  const tickerItems = useMemo(() => [
    ...(broadcastMsg ? [`📢 NOTICE: ${broadcastMsg}`] : []),
    ...courseUpdates,
    ...(!broadcastMsg && courseUpdates.length === 0 ? ["🏫 CAMPUS UPDATE: New state-of-the-art labs are now operational.", "📜 TTB Certificates are ready for collection."] : [])
  ], [broadcastMsg, courseUpdates]);

  const contentStr = tickerItems.join(" \u00A0\u00A0\u00A0\u00A0 | \u00A0\u00A0\u00A0\u00A0 ");

  return (
    <div className="relative z-40 no-print border-b border-fuchsia-100">
      <div className="bg-white h-20 md:h-24 flex items-center px-4 sm:px-10 border-b-4 border-fuchsia-600 overflow-hidden">
        <div className="max-w-[1600px] mx-auto w-full flex items-center gap-6 md:gap-12">
          <div className="flex flex-col justify-center border-r-2 border-slate-100 pr-6 md:pr-12 h-12 md:h-16 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveCourseName ? 'bg-fuchsia-500' : 'bg-emerald-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveCourseName ? 'bg-fuchsia-600' : 'bg-emerald-600'}`}></span>
              </span>
              <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap ${liveCourseName ? 'text-fuchsia-600' : 'text-emerald-700'}`}>
                {liveCourseName ? 'Live Now' : 'Campus Status'}
              </span>
            </div>
            <button onClick={onJoin} className="group flex flex-col items-start transition-all">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] md:text-sm font-black uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4 ${liveCourseName ? 'text-fuchsia-700' : 'text-slate-900'}`}>
                  {liveCourseName ? 'Join Session' : 'Access Portal'}
                </span>
              </div>
            </button>
          </div>
          <div className="flex-grow min-w-0 py-2">
            {liveCourseName ? (
              <div className="animate-fade-in flex flex-col sm:flex-row sm:items-baseline gap-1 md:gap-4">
                <h4 className="text-base md:text-2xl lg:text-3xl font-serif font-black text-slate-900 truncate leading-none">
                  {liveCourseName}
                </h4>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-slate-400 font-medium text-sm md:text-lg truncate italic">
                Welcome to the digital node of Akbar Khan Foundation...
              </div>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0 bg-fuchsia-50 px-6 py-2.5 rounded-full border border-fuchsia-100">
             <div className="w-2 h-2 bg-fuchsia-500 rounded-full"></div>
             <span className="text-[10px] font-black text-fuchsia-800 uppercase tracking-widest">Verified Institution</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 h-10 md:h-12 flex items-center overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex items-center" style={{ animationDuration: '30s' }}>
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] px-12 text-white">{contentStr}</span>
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] px-12 text-white">{contentStr}</span>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ user, onDemoLogin, onOpenAuth }) => {
  const navigate = useNavigate();
  const [showAiGlobal, setShowAiGlobal] = useState(false);
  const [aiGlobalInput, setAiGlobalInput] = useState('');
  const [aiGlobalRes, setAiGlobalRes] = useState('');
  const [aiGlobalLoading, setAiGlobalLoading] = useState(false);

  const askGlobal = async () => {
    if (!aiGlobalInput.trim() || aiGlobalLoading) return;
    setAiGlobalLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: aiGlobalInput,
        config: { systemInstruction: "Assistant for Akbar Khan Foundation. Provide answers in the user's language. We provide free Fashion, Computer, Beautician, and Language courses." }
      });
      setAiGlobalRes(result.text || '');
    } catch { setAiGlobalRes('Network error.'); }
    setAiGlobalLoading(false);
  };

  return (
    <div className="animate-fade-in bg-white overflow-x-hidden">
      {/* ⚠️ PRODUCTION CONNECTIVITY ALERT ⚠️ */}
      {!isSupabaseConfigured && (
        <div className="bg-rose-600 text-white py-3 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] animate-pulse no-print">
          ⚠️ Administrative Alert: Institutional Database is Disconnected. Portal functions may be limited.
        </div>
      )}

      <TickerSystem onJoin={() => !user ? onOpenAuth('/lms') : navigate('/lms')} />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-white text-center py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?fm=webp&fit=crop&q=80&w=1600" className="w-full h-full object-cover brightness-[0.4]" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="inline-block py-2 px-6 rounded-full bg-fuchsia-600/30 border border-fuchsia-400/50 text-fuchsia-100 text-xs font-black uppercase tracking-[0.4em] mb-10 shadow-2xl backdrop-blur-md">
            Empowering Lives Through Education
          </span>
          <h1 className="text-5xl md:text-8xl serif mb-10 leading-[1.05] tracking-tight">
            Skill. Independence. <br/><span className="italic text-fuchsia-400">Dignity.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-200 max-w-3xl mx-auto mb-14 leading-relaxed font-light">
            Akbar Khan Foundation provides free high-quality technical education to underprivileged women, building futures beyond certificates.
          </p>
          
          <div className="flex flex-col items-center gap-4">
             <div className="flex flex-wrap justify-center gap-6">
                <Link to="/admission" className="px-12 py-6 bg-fuchsia-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-fuchsia-700 shadow-xl transition-all transform active:scale-95">
                  Enroll Today Free
                </Link>
                <button 
                  onClick={() => setShowAiGlobal(!showAiGlobal)}
                  className="px-12 py-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3"
                >
                  <i className="fa-solid fa-language text-fuchsia-400"></i>
                  <span>AI Assistant</span>
                </button>
             </div>

             {showAiGlobal && (
               <div className="mt-8 w-full max-w-xl bg-white text-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-left border border-fuchsia-100 animate-scale-in">
                  <div className="flex justify-between items-center mb-6">
                     <span className="font-bold text-fuchsia-700 uppercase tracking-widest text-xs">Global Multilingual Node</span>
                     <button onClick={() => setShowAiGlobal(false)} className="text-slate-300 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                  </div>
                  <textarea 
                    value={aiGlobalInput} onChange={e => setAiGlobalInput(e.target.value)}
                    placeholder="Ask in Urdu, Pashto or English..." 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl mb-4 text-sm focus:ring-2 focus:ring-fuchsia-500 outline-none h-28 resize-none" 
                  />
                  <button 
                    onClick={askGlobal} disabled={aiGlobalLoading}
                    className="w-full bg-fuchsia-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-fuchsia-700 transition"
                  >
                    {aiGlobalLoading ? 'Processing...' : '✨ Get AI Answer'}
                  </button>
                  {aiGlobalRes && (
                    <div className="mt-6 text-sm text-slate-600 bg-fuchsia-50/50 p-5 rounded-2xl border border-fuchsia-100 italic">
                      {aiGlobalRes}
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <span className="text-fuchsia-600 font-black uppercase tracking-[0.4em] text-[10px] block mb-4">Empowering Skills</span>
             <h2 className="text-4xl md:text-6xl serif text-slate-900 leading-tight">Master Professional <br/><span className="italic">Specializations</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STATIC_COURSES.map((c, i) => (
              <div key={i} className="group bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className="w-14 h-14 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                  <i className={`fa-solid ${i === 0 ? 'fa-scissors' : i === 1 ? 'fa-laptop-code' : i === 2 ? 'fa-chart-line' : 'fa-wand-magic-sparkles'}`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{c.title}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-light line-clamp-3">{c.description}</p>
                <Link to="/admission" className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest group-hover:underline">Apply Free →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden border border-white/5">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/20 blur-[100px] rounded-full"></div>
              <div className="relative z-10">
                <h2 className="text-3xl serif mb-6">Visualizing Impact</h2>
                <p className="text-slate-400 mb-8">Every woman skilled is a family empowered. Our graduates move on to start their own businesses or work in established industries.</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-3xl font-serif text-fuchsia-400">500+</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Graduates</p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-3xl font-serif text-fuchsia-400">100%</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Free Education</p>
                   </div>
                </div>
              </div>
           </div>
           <div>
              <span className="text-fuchsia-600 font-bold uppercase tracking-[0.4em] text-[10px] block mb-6">Our Impact</span>
              <h2 className="text-4xl md:text-6xl serif text-slate-900 mb-8">The Future You <br/><span className="italic text-fuchsia-600">Fund</span></h2>
              <p className="text-slate-600 text-lg font-light leading-relaxed mb-10">Every contribution directly funds the high-tech equipment and specialized trainers required to keep our institute the best in the region.</p>
              <Link to="/donate" className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-fuchsia-600 transition-all shadow-xl">
                 Support Our Mission
              </Link>
           </div>
        </div>
      </section>

      {/* Campus Map & Info */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="bg-slate-50 p-12 md:p-20 rounded-[4rem] border border-slate-100 relative">
               <span className="text-fuchsia-600 font-black uppercase tracking-[0.3em] text-[10px] block mb-8">Visit Our Campus</span>
               <h2 className="text-4xl md:text-6xl serif text-slate-900 mb-10 leading-tight">Baaz Plaza <br/><span className="italic text-fuchsia-600">Mardan</span></h2>
               <div className="space-y-6 mb-12">
                  <p className="text-xl font-bold text-slate-800">2nd Floor, Baaz Plaza, Gujar Garhi Bypass,</p>
                  <p className="text-lg text-slate-500 font-light italic">Charsadda Chowk, Mardan, Pakistan.</p>
               </div>
               <a href="https://maps.app.goo.gl/VEJd46FgJ3UqzdRD9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-fuchsia-600 transition-all shadow-xl">
                 <i className="fa-solid fa-location-dot text-fuchsia-400"></i>
                 Navigate to Campus
               </a>
            </div>
            <div className="relative">
               <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                  <img src={GALLERY_ASSETS[0].src} className="w-full h-full object-cover" alt="Campus Building" />
               </div>
               <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-fuchsia-100 rounded-full -z-10 blur-2xl"></div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
