
import React, { useState } from 'react';
import { UserProfile, Student } from '../types';
import { mockAuth } from '../services/authService';
import { EditableText } from './EditableText';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile | Student) => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'reset'>(initialMode === 'signup' ? 'login' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    
    try {
      const user = await mockAuth.login(email, password);
      if (user) {
        onLogin(user);
        onClose();
      } else {
        setError('Invalid credentials. Check your institutional email and password.');
      }
    } catch (err) {
      setError('Connection error. Please check your network.');
    } finally {
      setIsProcessing(false);
    }
  };

  const setDemoAdmin = () => {
    setEmail('admin@ak.edu.pk');
    setPassword('admin123');
    setError('');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const result = await mockAuth.resetPassword(email, mobile, dob, password);
      if (result) {
        setSuccess('Security credentials synchronized. Log in with your new password.');
        setMode('login');
      } else {
        setError('Verification failed. Details do not match our records.');
      }
    } catch (err) {
      setError('A system error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl border border-teal-100 overflow-hidden animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-teal-600 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>
        </button>

        <div className="p-10 md:p-12">
          {mode === 'login' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-8 shadow-xl">AK</div>
              <h3 className="text-2xl font-serif text-slate-900 mb-2">Institutional Login</h3>
              <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold mb-10">Secure Gateway Access</p>

              {success && (
                <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-[9px] font-black uppercase text-center mb-6">
                  {success}
                </div>
              )}

              <form onSubmit={handleLogin} className="w-full space-y-5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                  <input 
                    required type="email" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 text-sm"
                    placeholder="name@ak-institute.edu.pk"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                  <input 
                    required type="password" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 text-sm"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-[9px] font-black uppercase text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={isProcessing}
                    type="submit" 
                    className="py-5 bg-teal-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-800 shadow-xl transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Verifying...' : 'Sign In Now'}
                  </button>
                  <button 
                    type="button"
                    onClick={setDemoAdmin}
                    className="py-5 bg-amber-500 text-amber-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 shadow-xl transition-all"
                  >
                    Demo Admin
                  </button>
                </div>
                
                <div className="flex flex-col items-center gap-4 pt-2">
                   <button type="button" onClick={() => setMode('reset')} className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-teal-600 transition-colors">Recovery Mode</button>
                   <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Hint: admin@ak.edu.pk / admin123</p>
                   </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-8 shadow-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"/></svg>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-2">Account Recovery</h3>
              <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold mb-10">Identity Verification</p>

              <form onSubmit={handleReset} className="w-full space-y-4">
                <input required type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={email} onChange={e => setEmail(e.target.value)} />
                <input required type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={mobile} onChange={e => setMobile(e.target.value)} />
                <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={dob} onChange={e => setDob(e.target.value)} />
                <div className="pt-2">
                  <input required type="password" placeholder="Define New Password" className="w-full p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-sm" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                
                {error && <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-[9px] font-black uppercase text-center">{error}</div>}

                <button disabled={isProcessing} type="submit" className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                  {isProcessing ? 'Verifying...' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => setMode('login')} className="w-full text-center text-[9px] font-black text-slate-500 uppercase hover:text-teal-600">Back to Login</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
