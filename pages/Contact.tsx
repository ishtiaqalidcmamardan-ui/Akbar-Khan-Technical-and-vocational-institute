
import React, { useState } from 'react';
import { EditableText } from '../components/EditableText';
import { INSTITUTION_NAME, INSTITUTION_TAG } from '../constants';

const Contact: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => setFormStatus('success'), 1500);
  };

  return (
    <div className="animate-fade-in bg-gray-50">
      {/* Header */}
      <section className="bg-teal-950 py-32 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="0.1" />
           </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <EditableText id="contact_hero_badge" defaultText="Get in Touch" className="text-teal-400 font-black uppercase tracking-[0.6em] text-xs block mb-8" />
          <h1 className="text-5xl md:text-8xl font-serif text-white mb-8">Contact the <span className="italic text-teal-400">Registrar</span></h1>
          <p className="text-xl text-teal-100/60 leading-relaxed font-light">Our administrative team is available to assist with admissions, technical support, and partnership inquiries.</p>
        </div>
      </section>

      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Contact Directory */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-3xl font-serif text-gray-900 mb-10">Institutional Directory</h2>
              <div className="space-y-8">
                {[
                  { id: 'dir_admissions', title: 'Admissions Office', email: 'admissions@ak-institute.edu.pk', phone: '+92 300 1234567' },
                  { id: 'dir_it', title: 'IT Support & LMS', email: 'support@ak-institute.edu.pk', phone: '+92 300 9876543' },
                  { id: 'dir_registrar', title: 'Registrar Office', email: 'registrar@ak-institute.edu.pk', phone: '+92 321 5556667' }
                ].map((dept) => (
                  <div key={dept.id} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <EditableText id={`contact_dept_title_${dept.id}`} tag="h3" defaultText={dept.title} className="text-lg font-bold text-gray-900 mb-4 block" />
                    <div className="space-y-3">
                      <p className="flex items-center gap-3 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        {dept.email}
                      </p>
                      <p className="flex items-center gap-3 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        {dept.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-teal-900 rounded-[3rem] text-white">
              <h3 className="text-2xl font-serif mb-6">Main Campus</h3>
              <p className="text-teal-100/70 text-sm leading-relaxed mb-8 italic">
                2nd Floor, Baaz Plaza, Gujar Garhi Bypass,<br/>
                Charsadda Chowk, Mardan.
              </p>
              <div className="h-48 bg-teal-950/50 rounded-2xl border border-white/5 flex items-center justify-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600">Map Integration Node</p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-gray-100">
              <h2 className="text-3xl font-serif text-gray-900 mb-4">Send an Inquiry</h2>
              <p className="text-gray-500 mb-12">Submit your details and our counselor will reach out within 24 working hours.</p>

              {formStatus === 'success' ? (
                <div className="py-20 text-center animate-scale-in">
                  <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="text-2xl font-serif text-gray-900 mb-4">Message Transmitted</h3>
                  <p className="text-gray-500 mb-8">Your inquiry has been logged into our institutional CRM.</p>
                  <button onClick={() => setFormStatus('idle')} className="text-teal-600 font-black text-xs uppercase tracking-widest hover:underline">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                      <input required type="email" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquiry Type</label>
                    <select required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                      <option>General Admission Inquiry</option>
                      <option>Technical Support / LMS Access</option>
                      <option>Donation & Sponsorship</option>
                      <option>Media & Partnerships</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Message</label>
                    <textarea required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all h-48" placeholder="How can we help you?"></textarea>
                  </div>
                  <button 
                    disabled={formStatus === 'sending'}
                    className="w-full py-6 bg-teal-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-teal-800 transition-all flex items-center justify-center gap-3"
                  >
                    {formStatus === 'sending' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Transmitting Inquiry...
                      </>
                    ) : 'Transmit Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Social Nodes */}
      <section className="py-32 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
           <h3 className="text-xl font-serif text-gray-900 mb-12">Connect with us on Social Media</h3>
           <div className="flex justify-center gap-8">
              {['Facebook', 'Instagram', 'LinkedIn', 'Twitter'].map((platform) => (
                <button key={platform} className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-teal-700 hover:bg-teal-700 hover:text-white transition-all shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest">{platform[0]}</span>
                </button>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
