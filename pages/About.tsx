
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { mockAuth } from '../services/authService';

const About: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Delay slightly to ensure layout is ready
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => setFormStatus('success'), 1500);
  };

  return (
    <div className="animate-fade-in bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-16 md:py-32 overflow-hidden bg-teal-950">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <EditableText id="about_hero_badge" defaultText="The AK Institutional Heritage" className="text-teal-400 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs block mb-6 md:mb-8" />
            <h1 className="text-4xl md:text-8xl font-serif text-white mb-6 md:mb-10 leading-[1.1] md:leading-none">A Legacy of <br className="md:hidden" /><span className="italic text-teal-400">Excellence</span></h1>
            <EditableText id="about_hero_p" tag="p" defaultText="Founded on the principle that quality technical education should be a universal right, not a luxury. Akbar Khan Institute has redefined vocational empowerment in the region." className="text-base md:text-xl text-teal-100/70 leading-relaxed font-light block" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950 to-transparent z-10"></div>
          <EditableImage id="about_hero_img" defaultSrc="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover grayscale opacity-30" />
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { id: 'v_excellence', title: 'Excellence', desc: 'Upholding TTB standards in every stitch and line of code.' },
              { id: 'v_integrity', title: 'Integrity', desc: 'Transparent governance and merit-based institutional growth.' },
              { id: 'v_empowerment', title: 'Empowerment', desc: 'Transforming underprivileged women into economic leaders.' },
              { id: 'v_innovation', title: 'Innovation', desc: 'Merging traditional vocational arts with modern technology.' }
            ].map((v) => (
              <div key={v.id} className="p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 group hover:bg-teal-900 transition-all duration-500">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-700 rounded-xl md:rounded-2xl mb-6 md:mb-8 flex items-center justify-center text-white font-black group-hover:bg-teal-400 group-hover:text-teal-950 transition-colors">
                  {v.title[0]}
                </div>
                <EditableText id={`about_val_title_${v.id}`} tag="h3" defaultText={v.title} className="text-xl md:text-2xl font-serif text-gray-900 mb-3 md:mb-4 group-hover:text-white block" />
                <EditableText id={`about_val_desc_${v.id}`} tag="p" defaultText={v.desc} className="text-xs md:text-sm text-gray-500 group-hover:text-teal-100/70 leading-relaxed block font-light" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Deep Dive */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 md:gap-20 items-center">
            <div className="w-full lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 md:-inset-10 bg-teal-50 rounded-[2.5rem] md:rounded-[4rem] -z-10 rotate-3"></div>
                <EditableImage id="about_founder_img" defaultSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" className="w-full aspect-[4/5] rounded-[2rem] md:rounded-[3.5rem] shadow-2xl object-cover" />
                <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 bg-teal-950 p-6 md:p-10 rounded-[1.8rem] md:rounded-[2.5rem] shadow-2xl text-white max-w-[200px] md:max-w-[280px]">
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1 md:mb-2">Our Founder</p>
                  <p className="text-base md:text-xl font-serif italic font-light">"Education is the only bridge to true independence."</p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 pt-8 lg:pt-0">
              <EditableText id="about_story_badge" defaultText="Our Purpose" className="text-teal-600 font-black uppercase tracking-widest text-[10px] md:text-xs block mb-4 md:mb-6" />
              <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-6 md:mb-10 leading-tight">Beyond a <br className="sm:hidden" /><span className="text-teal-600">Training Center</span></h2>
              <div className="space-y-6 md:space-y-8 text-gray-600 text-base md:text-lg font-light leading-relaxed">
                <EditableText id="about_story_p1" tag="p" defaultText="The Akbar Khan Institute was established in 2018 with a singular mission: to provide the marginalized women of our community with the skills required to compete in a 21st-century marketplace." className="block" />
                <EditableText id="about_story_p2" tag="p" defaultText="What started as a small tailoring center has evolved into a multi-disciplinary technical hub, now fully registered with the Trade Testing Board (TTB). We take pride in our 100% free fee structure, ensuring financial status never stands in the way of a woman’s potential." className="block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrated Contact Section */}
      <section id="contact-hub" className="py-20 md:py-32 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
            
            {/* Directory & Campus Info */}
            <div className="lg:col-span-5 space-y-8 md:space-y-12">
              <div>
                <span className="text-teal-600 font-black uppercase tracking-widest text-[10px] md:text-xs block mb-4 md:mb-6">Institutional Hub</span>
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 md:mb-10">Contact Directory</h2>
                <div className="space-y-4 md:space-y-6">
                  {[
                    { id: 'dir_admissions', title: 'Admissions Office', email: 'admissions@ak-institute.edu.pk', phone: '+92 300 1234567' },
                    { id: 'dir_it', title: 'IT Support & LMS', email: 'support@ak-institute.edu.pk', phone: '+92 300 9876543' },
                    { id: 'dir_registrar', title: 'Registrar Office', email: 'registrar@ak-institute.edu.pk', phone: '+92 321 5556667' }
                  ].map((dept) => (
                    <div key={dept.id} className="p-6 md:p-8 bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm group hover:bg-white hover:shadow-xl transition-all">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">{dept.title}</h3>
                      <div className="space-y-2 md:space-y-3">
                        <p className="flex items-center gap-3 text-xs md:text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                          <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          {dept.email}
                        </p>
                        <p className="flex items-center gap-3 text-xs md:text-sm text-gray-500">
                          <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          {dept.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 md:p-10 bg-teal-900 rounded-[2rem] md:rounded-[3rem] text-white">
                <h3 className="text-xl md:text-2xl font-serif mb-4 md:mb-6">Main Campus</h3>
                <p className="text-teal-100/70 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 italic">
                  2nd Floor, Baaz Plaza, Gujar Garhi Bypass,<br/>
                  Charsadda Chowk, Mardan.
                </p>
                <div className="h-24 md:h-32 bg-teal-950/50 rounded-2xl border border-white/5 flex items-center justify-center">
                   <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-teal-600">Verification Node Active</p>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl border border-gray-100">
                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-3 md:mb-4">Institutional Inquiry</h2>
                <p className="text-sm md:text-base text-gray-500 mb-8 md:mb-12">Submit your details and our registrar will reach out within 24 working hours.</p>

                {formStatus === 'success' ? (
                  <div className="py-12 md:py-20 text-center animate-scale-in">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                      <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-3 md:mb-4">Inquiry Received</h3>
                    <p className="text-sm md:text-gray-500 mb-6 md:mb-8">Your message has been safely logged in our database.</p>
                    <button onClick={() => setFormStatus('idle')} className="text-teal-600 font-black text-[10px] md:text-xs uppercase tracking-widest hover:underline">Send New Inquiry</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
                        <input required className="w-full p-4 md:p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
                        <input required type="email" className="w-full p-4 md:p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Inquiry Type</label>
                      <select required className="w-full p-4 md:p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm">
                        <option>General Admission Inquiry</option>
                        <option>Technical Support / LMS Access</option>
                        <option>Donation & Sponsorship</option>
                        <option>Curriculum Questions</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Message Content</label>
                      <textarea required className="w-full p-4 md:p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all h-32 md:h-48 resize-none text-sm"></textarea>
                    </div>
                    <button 
                      disabled={formStatus === 'sending'}
                      className="w-full py-4 md:py-6 bg-teal-700 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl hover:bg-teal-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {formStatus === 'sending' ? 'Transmitting...' : 'Transmit Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
