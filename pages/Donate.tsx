
import React, { useState } from 'react';
import { EditableText } from '../components/EditableText';

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
    color: 'bg-emerald-600',
    details: {
      bankName: 'Habib Bank Limited (HBL)',
      accountTitle: 'Akbar Khan Tech & Voc Institute',
      accountNumber: '12345678901234',
      iban: 'PK00HABA0012345678901234'
    }
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    logo: '📱',
    color: 'bg-green-500',
    details: {
      accountTitle: 'Akbar Khan Institute (Official)',
      accountNumber: '03001234567'
    }
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    logo: '🟡',
    color: 'bg-amber-500',
    details: {
      accountTitle: 'Akbar Khan Institute (Official)',
      accountNumber: '03007654321'
    }
  }
];

const PaymentModal: React.FC<{ 
  tier: any; 
  onClose: () => void;
}> = ({ tier, onClose }) => {
  const [step, setStep] = useState<'select' | 'details' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-teal-950/60 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-scale-in">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-teal-600 transition-colors z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
        </button>

        <div className="p-8 md:p-12">
          {step === 'select' && (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Donation Selection</p>
                <h3 className="text-3xl font-serif text-gray-900">{tier.title}</h3>
                <p className="text-xl font-serif text-teal-700 mt-2">{tier.amount}</p>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Select Payment Node</p>
                <div className="grid grid-cols-1 gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <button 
                      key={method.id}
                      onClick={() => { setSelectedMethod(method); setStep('details'); }}
                      className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-500 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{method.logo}</span>
                        <span className="font-bold text-gray-900">{method.name}</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'details' && selectedMethod && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('select')} className="p-2 text-gray-400 hover:text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5"/></svg>
                </button>
                <h3 className="text-xl font-serif text-gray-900">{selectedMethod.name} Details</h3>
              </div>

              <div className="bg-teal-900 p-8 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-800 rounded-full -mr-16 -mt-16 opacity-50"></div>
                
                <div className="relative z-10 space-y-6">
                  {selectedMethod.details.bankName && (
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Institution Bank</p>
                      <p className="text-base font-bold">{selectedMethod.details.bankName}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Account Title</p>
                    <p className="text-base font-bold">{selectedMethod.details.accountTitle}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Account Number</p>
                    <div className="flex items-center justify-between bg-teal-800/50 p-4 rounded-xl border border-white/10 group">
                      <p className="text-lg font-mono font-bold tracking-wider">{selectedMethod.details.accountNumber}</p>
                      <button 
                        onClick={() => handleCopy(selectedMethod.details.accountNumber)}
                        className="text-teal-400 hover:text-white transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2"/></svg>
                      </button>
                    </div>
                  </div>
                  {selectedMethod.details.iban && (
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">IBAN</p>
                      <div className="flex items-center justify-between bg-teal-800/50 p-4 rounded-xl border border-white/10">
                        <p className="text-[10px] md:text-xs font-mono font-bold break-all pr-4">{selectedMethod.details.iban}</p>
                        <button 
                          onClick={() => handleCopy(selectedMethod.details.iban!)}
                          className="text-teal-400 hover:text-white transition-colors p-2 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2"/></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {copied && (
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase text-center py-2 rounded-xl animate-fade-in">
                  Copied to Clipboard
                </div>
              )}

              <div className="space-y-4 pt-4">
                <p className="text-[10px] text-gray-500 text-center leading-relaxed italic">
                  Please complete the transfer and keep your receipt. You can email a screenshot of your contribution to <span className="text-teal-600 font-bold">donations@ak-institute.edu.pk</span> for a verification certificate.
                </p>
                <button 
                  onClick={() => setStep('success')}
                  className="w-full py-5 bg-teal-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-800 shadow-xl"
                >
                  I Have Transferred
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center space-y-8 animate-scale-in">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-gray-900 mb-2">Thank You for Your Impact</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Your generous contribution has been acknowledged. We are processing your donation record.</p>
              </div>
              <button 
                onClick={onClose}
                className="px-12 py-4 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
              >
                Return to Site
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Donate: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const tiers = [
    {
      id: 'kit',
      title: 'Student Kit',
      amount: 'PKR 2,500',
      description: 'Provide a complete kit including sewing tools or stationary for one student.',
      icon: '🎒'
    },
    {
      id: 'sponsor',
      title: 'Monthly Sponsor',
      amount: 'PKR 10,000',
      description: 'Cover the training and utility costs for one underprivileged woman for a full month.',
      icon: '🏫',
      featured: true
    },
    {
      id: 'fund',
      title: 'Equipment Fund',
      amount: 'PKR 50,000',
      description: 'Help us purchase high-end computers or sewing machines for our labs.',
      icon: '💻'
    }
  ];

  const handleTierSelect = (tier: any) => {
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  return (
    <div className="animate-fade-in relative min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-teal-950 py-24 md:py-40 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-800/30 rounded-full -mr-64 -mt-64 blur-[100px]"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <EditableText id="donate_hero_badge" defaultText="Charitable Foundation" className="text-teal-400 font-black uppercase tracking-[0.5em] text-[10px] md:text-xs block mb-8" />
          <EditableText id="donate_hero_title" tag="h1" defaultText="Fuel the Future" className="text-5xl md:text-8xl font-serif text-white mb-8 block leading-tight" />
          <EditableText id="donate_hero_desc" tag="p" defaultText="Your contributions help us keep technical education 100% free for those who need it most. Join us in breaking the cycle of poverty through skill mastery." className="text-xl md:text-2xl text-teal-100/70 leading-relaxed mb-12 block font-light max-w-3xl mx-auto" />
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <EditableText id="donate_tiers_title" tag="h2" defaultText="Choose Your Impact" className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 block" />
          <EditableText id="donate_tiers_desc" tag="p" defaultText="Select a contribution level that resonates with your vision for institutional change." className="text-gray-500 max-w-xl mx-auto text-lg block font-light" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {tiers.map((tier, idx) => (
            <div key={idx} className={`rounded-[3rem] p-10 md:p-14 flex flex-col items-center text-center transition-all ${tier.featured ? 'bg-teal-50 border-2 border-teal-500 shadow-2xl scale-105 relative z-10' : 'bg-white border border-gray-100 hover:shadow-xl'}`}>
              {tier.featured && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <EditableText id="donate_tier_featured_label" defaultText="Most Impactful" />
                </span>
              )}
              <div className="text-6xl mb-8 transform hover:scale-110 transition-transform duration-500">{tier.icon}</div>
              <EditableText id={`donate_tier_title_${tier.id}`} tag="h3" defaultText={tier.title} className="text-2xl font-bold text-gray-900 mb-3 block" />
              <EditableText id={`donate_tier_amt_${tier.id}`} tag="p" defaultText={tier.amount} className="text-3xl font-serif text-teal-700 mb-6 block" />
              <EditableText id={`donate_tier_desc_${tier.id}`} tag="p" defaultText={tier.description} className="text-gray-500 text-sm mb-12 flex-grow leading-relaxed block font-light" />
              <button 
                onClick={() => handleTierSelect(tier)}
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${tier.featured ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-white text-teal-950 border border-teal-100 hover:bg-teal-50'}`}
              >
                <EditableText id={`donate_tier_btn_${tier.id}`} defaultText="Donate Now" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Section */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <EditableText id="donate_corp_title" tag="h2" defaultText="Corporate & Large Grants" className="text-3xl font-serif text-gray-900 mb-6 block" />
          <EditableText id="donate_corp_desc" tag="p" defaultText="For institutional endowments, legacy naming rights, or large equipment grants, please reach out to our executive board directly for a formal proposal." className="text-gray-500 mb-10 block font-light leading-relaxed" />
          <a href="mailto:executive@ak-institute.edu.pk" className="text-teal-700 font-black text-xs uppercase tracking-widest hover:underline">
            Contact Executive Board →
          </a>
        </div>
      </section>

      {showPaymentModal && selectedTier && (
        <PaymentModal 
          tier={selectedTier} 
          onClose={() => { setShowPaymentModal(false); setSelectedTier(null); }} 
        />
      )}
    </div>
  );
};

export default Donate;
