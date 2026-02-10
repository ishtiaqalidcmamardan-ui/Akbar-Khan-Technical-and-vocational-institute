
import React, { useState, useRef, useEffect } from 'react';
import { mockAuth } from '../services/authService';
import { ResultRecord } from '../types';
import { EditableImage } from '../components/EditableImage';
import { EditableText } from '../components/EditableText';

const ResultAssistant: React.FC<{ onResultFound: (r: ResultRecord) => void }> = ({ onResultFound }) => {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string, data?: ResultRecord }[]>([
    { role: 'bot', text: 'Institutional Verification Node Active. Please provide the Roll Number to retrieve the DMC.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleBotResponse = async (userInput: string) => {
    setIsTyping(true);
    const rollMatch = userInput.match(/\d+/);
    const roll = rollMatch ? rollMatch[0] : null;

    setTimeout(async () => {
      if (!roll) {
        setMessages(prev => [...prev, { role: 'bot', text: 'I could not identify a valid Roll Number. Please provide a numeric ID.' }]);
      } else {
        const data = await mockAuth.fetchResult(roll);
        if (data) {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            text: `Record found for ${data.name}. This candidate has ${data.status.toLowerCase()}ed the ${data.courseTitle} exam with a grade of ${data.grade}.`,
            data: data
          }]);
          onResultFound(data);
        } else {
          setMessages(prev => [...prev, { role: 'bot', text: `Verification failed for Roll Number ${roll}.` }]);
        }
      }
      setIsTyping(false);
    }, 800);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const msg = input;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    handleBotResponse(msg);
  };

  return (
    <div className="bg-teal-950 rounded-[3rem] shadow-2xl border border-teal-800 overflow-hidden flex flex-col h-[600px] no-print">
      <div className="p-6 bg-teal-900/50 border-b border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center animate-pulse">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="3"/></svg>
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">IVA Bot</p>
         </div>
      </div>
      <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto space-y-6 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
             <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm ${m.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white/5 text-slate-300'}`}>
               {m.text}
             </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-6 bg-black/40 border-t border-white/10 flex gap-3">
         <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type roll number..." className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none" />
         <button type="submit" className="p-4 bg-teal-600 text-white rounded-2xl shadow-xl hover:bg-teal-500 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2.5"/></svg></button>
      </form>
    </div>
  );
};

const Results: React.FC = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [result, setResult] = useState<ResultRecord | null>(null);
  const [error, setError] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await mockAuth.fetchResult(rollNumber);
    if (data) {
      setResult(data);
      setError(false);
      setTimeout(() => {
        document.getElementById('dmc-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setResult(null);
      setError(true);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Direct call to window.print() is more reliable as it's triggered directly by a user gesture.
    // Modern browsers sometimes block delayed window.print() calls as suspicious.
    window.print();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-24 animate-fade-in print:py-0 print:bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-24 no-print">
          <div className="inline-flex items-center gap-3 bg-teal-100 text-teal-800 px-6 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Official Results Node</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-6">Institutional Results</h1>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 no-print">
          <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-gray-100 flex flex-col justify-center animate-scale-in">
            <EditableText id="results_manual_badge" defaultText="Verification Gateway" className="text-teal-600 font-black uppercase tracking-widest text-[10px] block mb-8" />
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Detailed Marks Retrieval</h2>
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <input required type="text" placeholder="Roll Number (e.g. 1001)" className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-teal-600 font-mono text-lg" value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
              <button type="submit" className="w-full py-5 bg-teal-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-800 transition-all shadow-xl active:scale-95">Retrieve Certificate</button>
            </form>
            {error && <p className="mt-6 text-rose-500 font-black text-[9px] uppercase tracking-widest animate-fade-in">System Error: Specified Roll Number not found in institutional records.</p>}
          </div>
          <ResultAssistant onResultFound={(r) => { setResult(r); setError(false); }} />
        </section>

        {result && (
          <section id="dmc-view" className="mb-32 animate-scale-in print:m-0 print:p-0">
            {/* START OF PRINTABLE CERTIFICATE */}
            <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border-[8px] border-double border-teal-900 relative print:border-none print:shadow-none print:p-0 print:rounded-none">
              
              {/* Institutional Header */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b-2 border-teal-900 pb-12 mb-12 print:pb-8 print:mb-8 print:border-teal-900">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-teal-900 text-white flex items-center justify-center font-black text-4xl rounded-2xl print:bg-black">AK</div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-serif text-gray-900 print:text-2xl">Akbar Khan Institute</h3>
                    <p className="text-[11px] font-black text-teal-700 uppercase tracking-[0.4em] print:text-[10px] print:text-black">Technical & Vocational (Regd. TTB)</p>
                  </div>
                </div>
                <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-teal-100 pl-0 md:pl-10 pt-6 md:pt-0 print:border-none print:p-0">
                  <h4 className="text-xl md:text-2xl font-serif text-gray-900 mb-1">DMC NO: 2024-{result.rollNumber}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{result.session} Session</p>
                </div>
              </div>

              {/* Candidate Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Name</p>
                   <p className="text-xl font-bold text-gray-900">{result.name}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Father's Name</p>
                   <p className="text-xl font-bold text-gray-900">{result.fatherName}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trade / Course</p>
                   <p className="text-xl font-bold text-gray-900">{result.courseTitle}</p>
                </div>
              </div>

              {/* MARKS TABLE - THE PRINTING SERVICE CORE */}
              <div className="overflow-x-auto mb-12">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-teal-900 text-white text-[11px] font-black uppercase tracking-widest print:bg-gray-100 print:text-black">
                      <th className="p-4 text-left border border-teal-800 print:border-gray-300">Sr #</th>
                      <th className="p-4 text-left border border-teal-800 print:border-gray-300">Subject Description</th>
                      <th className="p-4 text-center border border-teal-800 print:border-gray-300">Theory</th>
                      <th className="p-4 text-center border border-teal-800 print:border-gray-300">Practical</th>
                      <th className="p-4 text-center border border-teal-800 print:border-gray-300">Total Marks</th>
                      <th className="p-4 text-center border border-teal-800 print:border-gray-300">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.marks.map((m, idx) => (
                      <tr key={idx} className="text-sm font-bold text-gray-900">
                        <td className="p-5 border border-teal-100 text-center font-mono print:border-gray-200">{idx + 1}</td>
                        <td className="p-5 border border-teal-100 print:border-gray-200 uppercase tracking-tight">{result.courseTitle} Comprehensive</td>
                        <td className="p-5 border border-teal-100 text-center font-mono print:border-gray-200">{m.theory}</td>
                        <td className="p-5 border border-teal-100 text-center font-mono print:border-gray-200">{m.practical}</td>
                        <td className="p-5 border border-teal-100 text-center font-mono bg-teal-50 print:border-gray-200 print:bg-white">{m.total}</td>
                        <td className="p-5 border border-teal-100 text-center font-mono print:border-gray-200">{m.max}</td>
                      </tr>
                    ))}
                    <tr className="bg-teal-900 text-white font-black print:bg-gray-200 print:text-black">
                       <td colSpan={4} className="p-6 text-right uppercase tracking-[0.2em] text-[10px]">Grand Aggregate</td>
                       <td className="p-6 text-center font-mono text-xl">{result.totalObtained}</td>
                       <td className="p-6 text-center font-mono text-xl">{result.totalMax}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status Summary */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-t-2 border-teal-900 pt-12 print:border-teal-900">
                <div className="flex gap-12">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Final Grade</p>
                      <div className="w-24 h-24 bg-teal-950 text-white rounded-3xl flex items-center justify-center text-4xl font-serif font-black print:text-black print:bg-white print:border-2 print:border-black">
                        {result.grade}
                      </div>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Examination Result</p>
                      <div className={`px-8 py-4 rounded-full text-lg font-black uppercase tracking-widest border-4 ${result.status === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-600' : 'bg-rose-50 text-rose-700 border-rose-600'} print:border-black print:text-black print:bg-white`}>
                        {result.status}
                      </div>
                   </div>
                </div>

                {/* Verification QR Placeholder */}
                <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-teal-200 rounded-2xl flex flex-col items-center justify-center p-2 text-center print:border-gray-300">
                  <div className="w-16 h-16 bg-teal-900/10 mb-2 flex items-center justify-center">
                    <svg className="w-10 h-10 text-teal-900/20" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2h1v1h-1V5z" /></svg>
                  </div>
                  <p className="text-[7px] font-black text-teal-600 uppercase">Institutional Verification</p>
                </div>
              </div>

              {/* Institutional Signatures */}
              <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-12 text-center">
                 <div className="space-y-4">
                    <div className="h-px bg-gray-200 w-full mb-4"></div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Internal Controller</p>
                 </div>
                 <div className="space-y-4">
                    <div className="h-px bg-gray-200 w-full mb-4"></div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Registrar / Secretary</p>
                 </div>
                 <div className="space-y-4 hidden md:block">
                    <div className="h-px bg-teal-900 w-full mb-4"></div>
                    <p className="text-[9px] font-black text-teal-900 uppercase tracking-widest">Principal / CEO</p>
                 </div>
              </div>

              {/* Print Metadata for Verifiers */}
              <div className="hidden print:block mt-12 text-center">
                <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest">
                  This document was electronically generated and verified on {new Date().toLocaleString()} by AK-Digital Node.
                </p>
              </div>

              {/* PRINT TRIGGER BUTTON */}
              <div className="absolute top-12 right-12 no-print">
                <button 
                  type="button"
                  onClick={handlePrint} 
                  className="group relative flex items-center gap-4 bg-teal-700 text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-teal-800 transition-all active:scale-95"
                >
                  <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="1.5"/></svg>
                  Print Official DMC
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[8px] animate-pulse">Official</span>
                </button>
              </div>
            </div>
            {/* END OF PRINTABLE CERTIFICATE */}

            <div className="mt-12 text-center no-print">
               <button onClick={() => setResult(null)} className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:underline">Verify Another Record</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Results;
