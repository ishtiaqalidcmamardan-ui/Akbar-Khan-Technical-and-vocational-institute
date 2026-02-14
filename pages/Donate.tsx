import React, { useState } from 'react';
import { EditableText } from '../components/EditableText';
import { GoogleGenAI } from "@google/genai";

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  color: string;
  details: {
    bankName?: string;
    accountTitle: string;
    accountNumber: string;
    iban?: string;
  };
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'hbl',
    name: 'HBL Bank Transfer',
    logo: '🏦',
    color: 'bg-slate-600',
    details: {
      bankName: 'Habib Bank Limited (HBL)',
      accountTitle: 'Akbar Khan Foundation',
      accountNumber: '12345678901234',
      iban: 'PK00HABA0012345678901234'
    }
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    logo: '📱',
    color: 'bg-green-500',
    details: { accountTitle: 'Akbar Khan Foundation', accountNumber: '03001234567' }
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    logo: '🟡',
    color: 'bg-amber-500',
    details: { accountTitle: 'Akbar Khan Foundation', accountNumber: '03007654321' }
  }
];

const AIImpactConsultant: React.FC = () => {
  const [amt, setAmt] = useState('');
  const [res, setRes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!amt || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `$${amt} donation. Context: $50=sewing machine, $500=full diploma scholarship.`,
        config: { systemInstruction: "One beautiful, punchy sentence explaining the life-changing impact of this specific donation amount for a woman in Mardan." }
      });
      setRes(result.text || '');
    } catch { setRes('Calculating the future...'); }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden border border-white/5">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-600/20 blur-[100px] rounded-full"></div>
      <div className="relative z-10">
        <span className="text-teal-400 font-black uppercase tracking-[0.4em] text-[10px] block mb-6">✨ AI Impact Consultant</span>
        <h3 className="text-2xl font-serif mb-6 leading-tight">See the Change You Fund</h3>
        <div className="flex gap-2 mb-6">
          <input 
            type="number" value={amt} onChange={e => setAmt(e.target.value)}
            placeholder="Amt ($)" 
            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 outline-none focus:ring-1 focus:ring-teal-500" 
          />
          <button onClick={calculate} className="bg-teal-700 px-8 rounded-xl font-bold hover:bg-teal-800 transition shadow-lg shadow-teal-950/20">
            {loading ? '...' : 'Visualize'}
          </button>
        </div>
        {res && <p className="text-slate-300 italic text-sm leading-relaxed animate-fade-in">"{res}"</p>}
      </div>
    </div>
  );
};

const PaymentModal: React.FC<{ tier: any; onClose: () => void; }> = ({ tier, onClose }) => {
  const [step, setStep] = useState<'select' | 'details' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-scale-in">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-teal-600 z-10"><i className="fa-solid fa-xmark text-xl"></i></button>
        <div className="p-10">
          {step === 'select' && (
            <div className="space-y-8">
              <div className="text-center">
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2 block">Support Enrollment</span>
                <h3 className="text-3xl font-serif text-slate-900">{tier.title}</h3>
                <p className="text-xl font-bold text-teal-700 mt-2">{tier.amount}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMethod(m); setStep('details'); }} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-500 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4"><span className="text-2xl">{m.logo}</span><span className="font-bold text-slate-900">{m.name}</span></div>
                    <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-teal-600"></i>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 'details' && selectedMethod && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('select')} className="p-2 text-slate-400 hover:text-teal-600"><i className="fa-solid fa-arrow-left"></i></button>
                <h3 className="text-xl font-serif text-slate-900">{selectedMethod.name} Details</h3>
              </div>
              <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-600/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <div className="relative z-10 space-y-4">
                  <div><p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Account Title</p><p className="text-lg font-bold">{selectedMethod.details.accountTitle}</p></div>
                  <div><p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Number</p><p className="text-2xl font-mono font-bold tracking-wider">{selectedMethod.details.accountNumber}</p></div>
                </div>
              </div>
              <button onClick={() => setStep('success')} className="w-full py-5 bg-teal-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-800 shadow-xl transition-all">I Have Transferred</button>
            </div>
          )}
          {step === 'success' && (
            <div className="py-12 text-center space-y-8">
              <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><i className="fa-solid fa-check text-4xl"></i></div>
              <div><h3 className="text-2xl font-serif text-slate-900 mb-2">Thank You</h3><p className="text-slate-500 text-sm">Your contribution changes destinies.</p></div>
              <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Return to Site</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Donate: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<any>(null);

  const tiers = [
    { id: 'kit', title: 'Student Kit', amount: 'PKR 2,500', description: 'Provide complete tools for one student.', icon: '🎒' },
    { id: 'sponsor', title: 'Monthly Sponsor', amount: 'PKR 10,000', description: 'Cover training and utility costs for a month.', icon: '🏫', featured: true },
    { id: 'fund', title: 'Equipment Fund', amount: 'PKR 50,000', description: 'Purchase high-end machines for labs.', icon: '💻' }
  ];

  return (
    <div className="animate-fade-in bg-white min-h-screen">
      <section className="bg-slate-950 py-32 md:py-48 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="text-teal-400 font-black uppercase tracking-[0.6em] text-[10px] block mb-8">Fuel the Future</span>
          <h1 className="text-5xl md:text-8xl font-serif text-white mb-8 leading-tight">Your Contribution <br/><span className="italic text-teal-600">Changes Destinies</span></h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto">Help us keep high-quality technical education 100% free for underprivileged women.</p>
        </div>
      </section>

      <section className="py-32 max-w-7xl mx-auto px-6">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {tiers.map((tier) => (
                <div key={tier.id} className={`rounded-[3rem] p-12 flex flex-col items-center text-center transition-all ${tier.featured ? 'bg-teal-50 border-2 border-teal-500 shadow-2xl relative md:col-span-2' : 'bg-white border border-slate-100 hover:shadow-xl'}`}>
                  <div className="text-6xl mb-8">{tier.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.title}</h3>
                  <p className="text-3xl font-serif text-teal-700 mb-6">{tier.amount}</p>
                  <p className="text-slate-500 text-sm mb-12 flex-grow font-light leading-relaxed">{tier.description}</p>
                  <button onClick={() => setSelectedTier(tier)} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${tier.featured ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-slate-900 text-white hover:bg-teal-700'}`}>Donate Now</button>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4 sticky top-32">
               <AIImpactConsultant />
               <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <h4 className="font-serif text-xl text-slate-900 mb-4">Corporate Support</h4>
                  <p className="text-sm text-slate-500 font-light leading-relaxed mb-8">For endowment funds or institutional equipment grants, please reach out to our executive board.</p>
                  <a href="mailto:executive@ak-institute.edu.pk" className="text-teal-700 font-black uppercase text-[10px] tracking-widest hover:underline">Contact Board →</a>
               </div>
            </div>
         </div>
      </section>

      {selectedTier && <PaymentModal tier={selectedTier} onClose={() => setSelectedTier(null)} />}
    </div>
  );
};

export default Donate;