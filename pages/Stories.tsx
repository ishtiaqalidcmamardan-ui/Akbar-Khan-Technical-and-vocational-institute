
import React, { useState, useEffect } from 'react';
import { Testimonial } from '../types';
import { Link } from 'react-router-dom';
import { mockAuth } from '../services/authService';
import { EditableImage } from '../components/EditableImage';

const Stories: React.FC = () => {
  const [stories, setStories] = useState<Testimonial[]>([]);

  useEffect(() => {
    mockAuth.getStories().then(setStories);
  }, []);

  return (
    <div className="py-32 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-32">
          <span className="text-teal-600 font-bold tracking-[0.3em] uppercase text-xs">A Legacy of Change</span>
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mt-4 mb-8 leading-tight">Lives Transformed</h1>
          <p className="text-gray-500 max-w-3xl mx-auto text-xl leading-relaxed">
            Behind every statistic is a human story of courage. These women chose education as their path to independence.
          </p>
        </header>

        <div className="space-y-32">
          {stories.map((t, idx) => (
            <div 
              key={t.id} 
              className={`flex flex-col md:flex-row items-center gap-20 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="w-full md:w-2/5">
                <div className="relative">
                  <div className="absolute -inset-6 bg-teal-50 rounded-[4rem] -z-10 rotate-3 pointer-events-none"></div>
                  <EditableImage 
                    id={`story_img_${t.id}`}
                    defaultSrc={t.image} 
                    alt={t.name} 
                    className="w-full h-[600px] rounded-[3.5rem] shadow-2xl brightness-90 contrast-110 overflow-hidden"
                  />
                  <div className="absolute bottom-12 -right-6 md:-right-12 bg-white p-8 rounded-3xl shadow-xl border border-teal-100 max-w-[240px] z-10 pointer-events-none">
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mb-1">Impact Status</p>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{t.impact}</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-3/5">
                <div className="mb-10">
                  <span className="bg-teal-50 text-teal-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {t.course}
                  </span>
                  <span className="ml-6 text-gray-400 text-xs font-bold uppercase tracking-widest">{t.year}</span>
                </div>
                <h3 className="text-5xl font-serif text-gray-900 mb-10 leading-tight">"{t.name}"</h3>
                <div className="space-y-10">
                  <p className="text-2xl text-gray-600 italic leading-relaxed font-light">"{t.story}"</p>
                  <div className="w-16 h-px bg-teal-700"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-48 bg-teal-950 rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(13,148,136,0.3)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-800/20 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-800/10 rounded-full -ml-64 -mb-64 blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="text-teal-400 font-bold uppercase tracking-[0.4em] text-xs">Start Your Journey</span>
            <h2 className="text-5xl md:text-7xl font-serif text-white mt-6 mb-12">The Next Story is Yours</h2>
            <p className="text-teal-100/60 max-w-2xl mx-auto mb-16 text-xl leading-relaxed">
              Admission is open, education is free, and the future is waiting. Join the AK community today.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/admission" className="bg-white text-teal-950 px-16 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                Apply for Admission
              </Link>
              <Link to="/donate" className="bg-teal-800/40 backdrop-blur-md text-white border border-white/10 px-16 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-teal-800 transition-all">
                Sponsor a Student
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Stories;
