
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_LINKS, INSTITUTION_LINE_1, INSTITUTION_LINE_2 } from './constants.ts';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
import Courses from './pages/Courses.tsx';
import Admission from './pages/Admission.tsx';
import Results from './pages/Results.tsx';
import LMS from './pages/LMS.tsx';
import Donate from './pages/Donate.tsx';
import Stories from './pages/Stories.tsx';
import Boutique from './pages/Boutique.tsx';
import AuthModal from './components/AuthModal.tsx';
import SearchOverlay from './components/SearchOverlay.tsx';
import { Student, UserProfile } from './types.ts';
import { EditableText } from './components/EditableText.tsx';
import { EditableImage } from './components/EditableImage.tsx';
import { LiveSessionProvider } from './components/LiveSessionContext.tsx';
import { isSupabaseConfigured } from './services/supabase.ts';

interface NavbarProps {
  user: (UserProfile | Student) | null;
  onOpenAuth: (intendedPath?: string) => void;
  onOpenSearch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onOpenAuth, onOpenSearch }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-[100] no-print">
      <div className="bg-slate-950 text-white/70 py-2 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-10 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+923001234567" className="hidden sm:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-fuchsia-400 transition-colors">
              <i className="fa-solid fa-phone text-[8px]"></i> +92 300 1234567
            </a>
            <a href="mailto:info@ak-institute.edu.pk" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-fuchsia-400 transition-colors">
              <i className="fa-solid fa-envelope text-[8px]"></i> info@ak-institute.edu.pk
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[9px] font-black uppercase tracking-[0.2em] text-white/30 border-r border-white/10 pr-4">Regd. TTB Node</span>
            <div className="flex gap-3">
              <a href="#" className="hover:text-fuchsia-400 transition-colors"><i className="fa-brands fa-facebook-f text-xs"></i></a>
              <a href="#" className="hover:text-fuchsia-400 transition-colors"><i className="fa-brands fa-whatsapp text-xs"></i></a>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-10 h-20 lg:h-24 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 lg:gap-5 group">
            <div className="w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0">
              <EditableImage 
                id="nav_logo_v2" 
                defaultSrc="https://i.ibb.co/vz6W1yW/logo.png" 
                className="w-full h-full rounded-full border border-slate-100 bg-white shadow-sm p-1" 
                alt="Institutional Seal"
              />
            </div>
            <div className="hidden sm:flex flex-col border-l border-slate-200 pl-4 lg:pl-5">
              <EditableText 
                id="nav_inst_line1_v2" 
                tag="h1" 
                defaultText={INSTITUTION_LINE_1} 
                className="text-xs lg:text-lg font-bold text-slate-900 leading-tight uppercase tracking-tight font-serif" 
              />
              <EditableText 
                id="nav_inst_line2_v2" 
                tag="h2" 
                defaultText={INSTITUTION_LINE_2} 
                className="text-[9px] lg:text-xs font-semibold text-fuchsia-600 leading-none tracking-widest mt-0.5" 
              />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative ${
                  location.pathname === link.path 
                    ? 'text-fuchsia-600 bg-fuchsia-50' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={onOpenSearch} className="p-3 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-full transition-all">
              <i className="fa-solid fa-magnifying-glass text-lg"></i>
            </button>
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Link to="/lms" className="px-6 py-3 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-600 transition-all shadow-xl shadow-slate-200">
                  <i className="fa-solid fa-user-graduate mr-2"></i> Student Portal
                </Link>
              ) : (
                <button onClick={() => onOpenAuth()} className="px-6 py-3 bg-fuchsia-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-700 shadow-xl shadow-fuchsia-100 transition-all">
                  <i className="fa-solid fa-lock mr-2"></i> LMS Login
                </button>
              )}
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-900 rounded-xl border border-slate-200">
              <i className="fa-solid fa-bars-staggered text-xl"></i>
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl animate-scale-in origin-right flex flex-col">
            <div className="p-8 bg-slate-950 text-white flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-xl">
                  <img src="https://i.ibb.co/vz6W1yW/logo.png" className="w-full h-full object-contain" alt="Logo" />
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
              <div>
                <h3 className="text-lg font-serif">Academic Node</h3>
                <p className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">Akbar Khan Foundation</p>
              </div>
              <div className="flex gap-2">
                {user ? (
                  <Link to="/lms" className="flex-grow py-3 bg-fuchsia-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center">My Learning</Link>
                ) : (
                  <button onClick={() => { setIsMobileMenuOpen(false); onOpenAuth(); }} className="flex-grow py-3 bg-fuchsia-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Sign In</button>
                )}
                <Link to="/admission" className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest">Apply</Link>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-1">
              <p className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-50 mb-2">Main Directory</p>
              {NAV_LINKS.map((link) => (
                <Link key={link.path} to={link.path} className={`flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold transition-all ${location.pathname === link.path ? 'bg-fuchsia-50 text-fuchsia-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <i className={`fa-solid ${link.name === 'Home' ? 'fa-house' : link.name === 'About' ? 'fa-circle-info' : link.name === 'Courses' ? 'fa-book-open' : link.name === 'Results' ? 'fa-graduation-cap' : link.name === 'Admission' ? 'fa-id-card' : 'fa-circle-dot'} w-5 text-center opacity-40 text-xs`}></i>
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Contact</p>
              <div className="space-y-3">
                <a href="tel:+923001234567" className="flex items-center gap-3 text-xs text-slate-600 font-bold"><i className="fa-solid fa-phone text-fuchsia-600"></i> +92 300 1234567</a>
                <a href="mailto:info@ak-institute.edu.pk" className="flex items-center gap-3 text-xs text-slate-600 font-bold"><i className="fa-solid fa-envelope text-fuchsia-600"></i> Support Node</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-white/5 no-print">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-serif">{INSTITUTION_LINE_1}</h4>
            <p className="text-fuchsia-400 text-xs font-black uppercase tracking-widest">{INSTITUTION_LINE_2}</p>
          </div>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isSupabaseConfigured ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest">{isSupabaseConfigured ? 'DB Connected' : 'DB Disconnected'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/5 border-white/10 text-white/40">
              <span className="text-[9px] font-black uppercase tracking-widest">© 2024 AK Foundation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<(UserProfile | Student) | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOpenAuth = (intendedPath?: string) => {
    setPendingRedirect(intendedPath || null);
    setIsAuthModalOpen(true);
  };

  const handleLogin = (user: UserProfile | Student) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (pendingRedirect) {
      navigate(pendingRedirect);
      setPendingRedirect(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={currentUser} onOpenAuth={handleOpenAuth} onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home user={currentUser} onDemoLogin={handleLogin} onOpenAuth={handleOpenAuth} />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/admission" element={<Admission onEnroll={handleLogin} />} />
          <Route path="/results" element={<Results />} />
          <Route path="/lms" element={<LMS externalUser={currentUser} onAuthUpdate={setCurrentUser} />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/boutique" element={<Boutique />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LiveSessionProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </LiveSessionProvider>
  );
};

export default App;
