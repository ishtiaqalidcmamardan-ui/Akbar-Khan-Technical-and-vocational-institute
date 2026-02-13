
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EXECUTIVE_MESSAGES, COURSES as STATIC_COURSES, BOUTIQUE_PRODUCTS, GALLERY_ASSETS } from '../constants.ts';
import AIChat from '../components/AIChat.tsx';
import { EditableText } from '../components/EditableText.tsx';
import { EditableImage } from '../components/EditableImage.tsx';
import { Student, UserProfile } from '../types.ts';
import { mockAuth } from '../services/authService.ts';

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
          const date = c.nextClassTime ? new Date(c.nextClassTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Soon';
          updates.push(`📅 ACADEMIC INTAKE: ${c.title} starting ${date}. Apply Now.`);
        }
      });

      setCourseUpdates(updates);
      setLiveCourseName(activeCourse);
    };

    fetchUpdates();

    const handleUpdate = () => {
      setBroadcastMsg(localStorage.getItem('ak_global_broadcast') || '');
    };

    window.addEventListener('storage', (e) => {
      if (e.key === 'ak_global_broadcast') handleUpdate();
    });

    window.addEventListener('ak_broadcast_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('ak_broadcast_updated', handleUpdate);
    };
  }, []);

  const tickerItems = useMemo(() => [
    ...(broadcastMsg ? [`📢 ADMIN NOTICE: ${broadcastMsg}`] : []),
    ...courseUpdates,
    ...(!broadcastMsg && courseUpdates.length === 0 ? [
        "🏫 CAMPUS UPDATE: New state-of-the-art computer labs are now operational.",
        "📜 VERIFICATION: Official TTB certificates for the 2023 session are ready for collection.",
        "🌟 EMPOWERMENT: Join our community of over 1,200 successful graduates.",
      ] : [])
  ], [broadcastMsg, courseUpdates]);

  const contentStr = tickerItems.join(" \u00A0\u00A0\u00A0\u00A0 | \u00A0\u00A0\u00A0\u00A0 ");

  const duration = useMemo(() => {
    const baseLength = contentStr.length;
    return Math.max(15, baseLength * 0.15); 
  }, [contentStr]);

  return (
    <div className="relative z-40 no-print border-b border-emerald-900/10">
      <div className="bg-white h-20 md:h-24 flex items-center px-4 sm:px-10 shadow-lg overflow-hidden border-b-4 border-emerald-900">
        <div className="max-w-[1600px] mx-auto w-full flex items-center gap-6 md:gap-12">
          <div className="flex flex-col justify-center border-r-2 border-slate-100 pr-6 md:pr-12 h-12 md:h-16 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveCourseName ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveCourseName ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
              </span>
              <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap ${liveCourseName ? 'text-rose-600' : 'text-emerald-700'}`}>
                {liveCourseName ? 'Live Now' : 'Campus Status'}
              </span>
            </div>
            <button onClick={onJoin} className="group flex flex-col items-start transition-all active:scale-95">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] md:text-sm font-black uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4 ${liveCourseName ? 'text-rose-700' : 'text-slate-900'}`}>
                  {liveCourseName ? 'Join Session' : 'Access Portal'}
                </span>
                <svg className={`w-3 h-3 group-hover:translate-x-1 transition-transform ${liveCourseName ? 'text-rose-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
          <div className="flex-grow min-w-0 flex items-center overflow-hidden py-2">
            {liveCourseName ? (
              <div className="animate-fade-in flex flex-col sm:flex-row sm:items-baseline gap-1 md:gap-4">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] bg-rose-50 px-2 py-0.5 rounded border border-rose-100 w-fit">In Progress</span>
                <h4 className="text-base md:text-2xl lg:text-3xl font-serif font-black text-slate-900 truncate tracking-tight leading-none">
                  {liveCourseName}
                </h4>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-slate-500 font-bold text-sm md:text-lg truncate animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-emerald-100 hidden md:block"></span>
                Welcome to the digital node of Akbar Khan Institute...
              </div>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0 bg-emerald-50 px-6 py-2.5 rounded-2xl border-2 border-emerald-100 shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
             <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">TTB Verified Portal</span>
          </div>
        </div>
      </div>
      <div className="bg-emerald-950 h-10 md:h-12 flex items-center overflow-hidden relative shadow-inner">
        <div className="w-full relative flex items-center h-full">
          <div className="animate-marquee whitespace-nowrap flex items-center" style={{ animationDuration: `${duration}s` }}>
            <span className="text-[11px] md:text-sm font-bold uppercase tracking-[0.15em] px-12 text-emerald-50">{contentStr}</span>
            <span className="text-[11px] md:text-sm font-bold uppercase tracking-[0.15em] px-12 text-emerald-50">{contentStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountHub: React.FC<{ onLogin: (u: UserProfile | Student, redirect?: string) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      const user = await mockAuth.login(email, password);
      if (user) onLogin(user, '/lms');
      else setError('Verification failed. Invalid institutional credentials.');
    } catch (err) {
      setError('System connection error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const setDemoAdmin = () => {
    setEmail('admin@ak.edu.pk');
    setPassword('admin123');
    setError('');
  };

  return (
    <section id="portal-hub" className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <EditableText id="portal_hub_badge" defaultText="AUTHORIZED INSTITUTIONAL ACCESS" className="text-emerald-800 font-black uppercase tracking-[0.5em] text-[10px] block mb-6" />
            <h2 className="text-4xl md:text-7xl font-serif text-slate-900 mb-8 leading-[1.1]">Portal <br/><span className="italic text-emerald-600">& Governance</span></h2>
            <p className="text-base md:text-lg text-slate-500 leading-relaxed font-light max-w-lg mb-12">Securely access the Learning Management System or verify institutional records.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Link to="/admission" className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeWidth="2" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Apply Now</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">New Student Enrollment</p>
               </Link>
               <Link to="/results" className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Verify Result</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">DMC Verification Node</p>
               </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 relative">
              <div className="absolute top-0 right-0 p-8"><div className="bg-emerald-900 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">AK</div></div>
              {mode === 'login' ? (
                <>
                  <h3 className="text-2xl font-serif text-slate-900 mb-2">Sign In</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-10">LMS & Staff Credentials</p>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <input required type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border rounded-2xl text-sm" value={email} onChange={e => setEmail(e.target.value)} />
                    <input required type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border rounded-2xl text-sm" value={password} onChange={e => setPassword(e.target.value)} />
                    {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase text-center">{error}</div>}
                    <div className="grid grid-cols-2 gap-4">
                      <button type="submit" disabled={isProcessing} className="py-5 bg-emerald-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-950 shadow-xl transition-all">Sign In</button>
                      <button type="button" onClick={setDemoAdmin} className="py-5 bg-amber-500 text-amber-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 shadow-xl transition-all">Admin Demo</button>
                    </div>
                  </form>
                </>
              ) : null }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MosaicBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden grid grid-cols-12 grid-rows-2 gap-1 md:gap-3 p-1 md:p-3 opacity-[0.7] lg:opacity-[0.85] pointer-events-none transition-opacity duration-1000">
      <div className="col-span-8 row-span-2 rounded-[2rem] md:rounded-[4rem] overflow-hidden bg-emerald-950 shadow-inner border border-emerald-900/10">
         <img src={GALLERY_ASSETS[0].src} className="w-full h-full object-cover ken-burns brightness-90" alt="Main Building Front" />
      </div>
      <div className="col-span-4 row-span-1 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-teal-950 shadow-inner">
         <img src={GALLERY_ASSETS[4].src} className="w-full h-full object-cover brightness-75 opacity-90" alt="IT Hub" />
      </div>
      <div className="col-span-4 row-span-1 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-slate-950 shadow-inner">
         <img src={GALLERY_ASSETS[1].src} className="w-full h-full object-cover brightness-75 opacity-90" alt="Vocational Lab" />
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ user, onDemoLogin, onOpenAuth }) => {
  const navigate = useNavigate();
  const [activeGallery, setActiveGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handleJoinClassroom = () => {
    if (!user) onOpenAuth('/lms');
    else navigate('/lms');
  };

  return (
    <div className="animate-fade-in bg-white overflow-x-hidden">
      <TickerSystem onJoin={handleJoinClassroom} />
      
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden py-20 md:py-0">
        <MosaicBackground />
        
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent pointer-events-none z-[1]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-4xl p-4 md:p-8">
            <div className="inline-flex items-center gap-3 bg-emerald-900 text-white px-6 py-2 rounded-full mb-10 shadow-xl">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
              <EditableText id="hero_badge_light" defaultText="PREMIER TTB-CERTIFIED INSTITUTE" className="text-[10px] font-black uppercase tracking-[0.3em] block" />
            </div>
            
            <h1 
               className="text-5xl md:text-[9rem] font-serif text-slate-950 mb-10 leading-[1.05] md:leading-[0.8] tracking-tighter"
               style={{ 
                 textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff'
               }}
            >
              Crafting <br className="hidden md:block"/>
              <span className="italic text-emerald-800">Competence.</span>
            </h1>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 mt-12 md:mt-20">
               <div className="flex flex-col gap-4">
                  <Link to="/admission" className="px-14 py-6 bg-emerald-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-950 hover:shadow-2xl transition-all transform active:scale-95 text-center shadow-emerald-900/10">
                    Enroll Today
                  </Link>
                  <p 
                    className="text-[9px] text-slate-900 font-black uppercase tracking-[0.4em] text-center"
                    style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}
                  >100% Free Scholarship</p>
               </div>
               
               <div className="h-px md:h-24 w-40 md:w-px bg-emerald-950/20"></div>
               
               <div className="max-w-md">
                  <p 
                    className="text-slate-950 text-base md:text-xl leading-relaxed font-bold"
                    style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}
                  >
                    Transforming underprivileged women into market leaders through <span className="text-emerald-900 underline decoration-amber-500 decoration-4 underline-offset-4">specialized trade certifications</span> at Baaz Plaza.
                  </p>
               </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-8 right-12 z-20">
           {!activeGallery ? (
             <button 
              onClick={() => setActiveGallery(true)}
              className="flex items-center gap-4 bg-white/95 backdrop-blur-2xl p-4 md:p-6 rounded-[2.5rem] border border-emerald-900/10 shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:scale-105 transition-all group"
             >
                <div className="flex -space-x-5">
                   {GALLERY_ASSETS.slice(0, 3).map((img, i) => (
                     <div key={i} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white overflow-hidden shadow-xl">
                        <img src={img.src} className="w-full h-full object-cover" alt="Preview" />
                     </div>
                   ))}
                </div>
                <div className="pr-4 text-left">
                   <p className="text-[9px] font-black text-emerald-900 uppercase tracking-widest leading-none mb-1">Campus View</p>
                   <p className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 transition-colors">See the Gallery →</p>
                </div>
             </button>
           ) : (
             <div className="w-[320px] md:w-[460px] bg-white rounded-[3.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden animate-scale-in">
                <div className="relative aspect-video bg-slate-900">
                   <img src={GALLERY_ASSETS[galleryIndex].src} className="w-full h-full object-cover" alt="Gallery View" />
                   <button onClick={() => setActiveGallery(false)} className="absolute top-5 right-5 bg-white/20 backdrop-blur-lg p-2.5 rounded-full text-white hover:bg-rose-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                   </button>
                </div>
                <div className="p-8 flex items-center justify-between bg-white">
                   <div className="max-w-[65%]">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{GALLERY_ASSETS[galleryIndex].category}</p>
                      <h4 className="text-xl font-serif text-slate-900 truncate leading-tight">{GALLERY_ASSETS[galleryIndex].title}</h4>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setGalleryIndex((galleryIndex - 1 + GALLERY_ASSETS.length) % GALLERY_ASSETS.length)} className="p-4 bg-slate-50 rounded-full hover:bg-teal-50 text-slate-400 hover:text-teal-700 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3"/></svg>
                      </button>
                      <button onClick={() => setGalleryIndex((galleryIndex + 1) % GALLERY_ASSETS.length)} className="p-4 bg-slate-50 rounded-full hover:bg-teal-50 text-slate-400 hover:text-teal-700 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3"/></svg>
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </section>

      <section className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="relative">
                <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl relative z-10 group border-8 border-white">
                   {/* Optimized: fit explicitly requested as webp */}
                   <EditableImage id="philosophy_img_light" defaultSrc="https://images.unsplash.com/photo-1556740758-90de374c12ad?fm=webp&fit=crop&q=80&w=1200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-50 rounded-[3rem] -z-10 rotate-12"></div>
             </div>
             <div>
                <EditableText id="vision_badge_light" defaultText="ACADEMIC MISSION" className="text-emerald-800 font-black uppercase tracking-[0.5em] text-[10px] block mb-8" />
                <h2 className="text-4xl md:text-7xl font-serif text-slate-900 mb-10 leading-[1.1]">Skill is the <br/><span className="italic text-emerald-700">New Standard</span></h2>
                <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed mb-12">Our curriculum is architected to deliver measurable economic impact.</p>
                <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-12">
                   <div>
                      <p className="text-5xl font-serif text-emerald-900 mb-2">1.2K</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Graduates Certified</p>
                   </div>
                   <div>
                      <p className="text-5xl font-serif text-emerald-900 mb-2">0</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuition Fee</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24 md:py-32 overflow-hidden border-y border-emerald-50">
        <div className="flex flex-col gap-12">
           <div className="px-6 text-center">
              <EditableText id="courses_badge_light" defaultText="TTB-APPROVED PROGRAMS" className="text-emerald-800 font-black uppercase tracking-[0.4em] text-[10px] block mb-4" />
              <h3 className="text-3xl md:text-5xl font-serif text-slate-900">Vocational Pathways</h3>
           </div>
           <div className="flex animate-marquee whitespace-nowrap gap-10">
              {STATIC_COURSES.concat(STATIC_COURSES).map((course, i) => (
                <Link key={i} to="/courses" className="flex-shrink-0 w-[380px] h-[520px] bg-white rounded-[2.5rem] p-4 group border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700">
                   <div className="h-2/3 w-full rounded-[2rem] overflow-hidden mb-8">
                      <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={course.title} />
                   </div>
                   <div className="px-6">
                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">{course.category}</span>
                      <h4 className="text-2xl font-serif text-slate-900 mt-4 mb-2">{course.title}</h4>
                   </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      <section className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-50 rounded-[4rem] p-12 md:p-24 flex flex-col lg:flex-row gap-20 items-center relative overflow-hidden border border-emerald-100 shadow-xl">
            <div className="w-full lg:w-1/3 z-10">
              <div className="relative">
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                   <EditableImage id="ceo_img_light" defaultSrc={EXECUTIVE_MESSAGES.ceo.image} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-2/3 z-10">
              <EditableText id="ceo_badge_light" defaultText="FOUNDER'S ADDRESS" className="text-emerald-800 font-black uppercase tracking-[0.5em] text-[10px] block mb-8" />
              <h3 className="text-3xl md:text-5xl font-serif text-slate-900 mb-10 leading-tight">"Our vision is to replace vulnerability with <span className="italic text-emerald-700">specialized competence.</span>"</h3>
              <EditableText id="ceo_text_light" tag="p" defaultText={EXECUTIVE_MESSAGES.ceo.message} className="text-slate-500 text-lg md:text-xl font-light leading-relaxed block" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
              <div className="max-w-xl">
                 <EditableText id="sale_badge_light" defaultText="INSTITUTIONAL ATELIER" className="text-emerald-800 font-black uppercase tracking-[0.5em] text-[10px] block mb-6" />
                 <h2 className="text-4xl md:text-7xl font-serif text-slate-900">The Student <br/><span className="italic text-emerald-700">Atelier</span></h2>
              </div>
              <Link to="/boutique" className="px-10 py-5 bg-white border border-emerald-900/10 text-emerald-900 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-900 hover:text-white transition-all shadow-sm">Browse Collection</Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {BOUTIQUE_PRODUCTS.slice(0, 3).map((product, i) => (
                <div key={i} className="group cursor-pointer" onClick={() => navigate('/boutique')}>
                   <div className="aspect-[3/4] rounded-[3rem] overflow-hidden mb-8 shadow-md group-hover:shadow-2xl transition-all duration-700">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={product.name} />
                   </div>
                   <h4 className="text-xl md:text-2xl font-serif text-slate-900 mb-2">{product.name}</h4>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="py-24 md:py-40 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block mb-12">
            <EditableText id="map_badge_light" defaultText="VISIT OUR CAMPUS" className="text-emerald-800 font-black uppercase tracking-[0.4em] text-[10px] block mb-6" />
            <h2 className="text-5xl md:text-8xl font-serif text-gray-900 leading-none">Baaz Plaza <br/><span className="italic text-emerald-700">Mardan</span></h2>
          </div>
          <div className="max-w-4xl mx-auto bg-slate-50 p-12 md:p-24 rounded-[4rem] border border-emerald-50 shadow-sm relative z-10">
             <div className="space-y-12 mb-16">
                <EditableText id="address_line1_light" tag="p" defaultText="2nd Floor, Baaz Plaza, Gujar Garhi Bypass," className="text-xl md:text-3xl text-slate-900 font-black block leading-tight mb-3" />
                <EditableText id="address_line2_light" tag="p" defaultText="Charsadda Chowk, Mardan, Pakistan." className="text-lg md:text-xl text-slate-500 block font-light" />
             </div>
             <div className="flex justify-center">
               <a href="https://maps.app.goo.gl/VEJd46FgJ3UqzdRD9" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-4 px-12 py-6 bg-emerald-900 text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-xl">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>Navigate to Campus</span>
               </a>
             </div>
          </div>
        </div>
      </section>

      <AccountHub onLogin={onDemoLogin} />
      <AIChat />
    </div>
  );
};

export default Home;
