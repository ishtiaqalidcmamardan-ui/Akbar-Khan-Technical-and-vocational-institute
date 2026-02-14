
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

interface NavbarProps {
  user: (UserProfile | Student) | null;
  onOpenAuth: (intendedPath?: string) => void;
  onOpenSearch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onOpenAuth, onOpenSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavLinkClick = (e: React.MouseEvent, path: string, name: string) => {
    if (name === 'LMS' && !user) {
      e.preventDefault();
      setIsOpen(false);
      onOpenAuth('/lms');
    }
  };

  return (
    <nav className="bg-teal-950 shadow-2xl sticky top-0 z-50 no-print">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-3 lg:py-5 border-b border-teal-900/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0 min-w-0">
            <Link to="/" className="flex items-center gap-3 lg:gap-5 group min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 relative flex-shrink-0">
                <EditableImage 
                  id="nav_logo_v4" 
                  defaultSrc="https://i.ibb.co/vz6W1yW/logo.png" 
                  className="w-full h-full rounded-full border-2 border-teal-500/30 bg-white shadow-lg overflow-hidden" 
                  alt="Institute Badge"
                />
              </div>
              <div className="flex flex-col min-w-0 justify-center">
                <EditableText 
                  id="nav_inst_line1_v6" 
                  tag="h1" 
                  defaultText={INSTITUTION_LINE_1} 
                  className="text-[10px] sm:text-xs md:text-lg lg:text-xl font-black text-white leading-none uppercase tracking-tight truncate" 
                />
                <EditableText 
                  id="nav_inst_line2_v6" 
                  tag="h2" 
                  defaultText={INSTITUTION_LINE_2} 
                  className="text-[8px] sm:text-[9px] md:text-sm lg:text-base font-black text-teal-400 leading-none uppercase tracking-wider mt-0.5" 
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 ml-4">
            <button 
              onClick={onOpenSearch}
              className="p-3 text-teal-100/60 hover:text-white hover:bg-white/10 rounded-full transition-all group"
              aria-label="Open Institutional Search"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <Link to="/lms" className="px-5 py-3 bg-amber-500 text-amber-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 shadow-xl transition-all whitespace-nowrap">
                  My Portal
                </Link>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => onOpenAuth()} className="px-5 py-3 bg-teal-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all whitespace-nowrap">
                    Sign In
                  </button>
                  <Link to="/admission" className="hidden lg:block px-5 py-3 bg-teal-500 text-teal-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-400 shadow-lg transition-all whitespace-nowrap">
                    Apply Now
                  </Link>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsOpen(true)} 
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-teal-600/20 text-teal-400 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all active:scale-95 border border-teal-400/30"
              aria-label="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-teal-900/30 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center h-12 gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={(e) => handleNavLinkClick(e, link.path, link.name)}
                className={`px-4 py-2 rounded-lg text-[9px] lg:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  location.pathname === link.path 
                    ? 'bg-teal-600 text-white shadow-lg' 
                    : 'text-teal-100/60 hover:text-white hover:bg-teal-800/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-teal-950/95 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl flex flex-col animate-scale-in border-l border-teal-500/10">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <span className="text-teal-600 font-black text-[10px] uppercase tracking-[0.4em]">Index</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-rose-500 p-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="flex-grow p-4 space-y-1 overflow-y-auto bg-white">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={(e) => handleNavLinkClick(e, link.path, link.name)}
                  className={`block px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    location.pathname === link.path 
                      ? 'bg-teal-50 text-teal-700 font-black' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">
              {user ? (
                <Link to="/lms" className="block w-full py-4 bg-amber-500 text-amber-950 rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-md">My Portal</Link>
              ) : (
                <>
                  <button onClick={() => { setIsOpen(false); onOpenAuth(); }} className="w-full py-4 bg-teal-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Sign In</button>
                  <Link to="/admission" className="block w-full py-4 bg-teal-500 text-teal-950 rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg">Apply Now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
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
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
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
