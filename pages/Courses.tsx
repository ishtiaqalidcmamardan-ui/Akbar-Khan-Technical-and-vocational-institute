
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { Link } from 'react-router-dom';
import { mockAuth } from '../services/authService';
import { EditableImage } from '../components/EditableImage';
import { EditableText } from '../components/EditableText';

const Courses: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    mockAuth.getCourses().then(data => {
      setCourses(data.filter(c => c.status !== 'frozen'));
    });
  }, []);

  const categories: string[] = ['All', ...Array.from(new Set<string>(courses.map(c => c.category)))];
  const filtered = filter === 'All' ? courses : courses.filter(c => c.category === filter);

  return (
    <div className="py-32 animate-fade-in bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-24">
          <EditableText id="courses_catalog_badge" defaultText="Institutional Catalog" className="text-teal-600 font-bold uppercase tracking-[0.3em] text-xs block mb-4" />
          <EditableText id="courses_catalog_title" tag="h1" defaultText="Professional Pathways" className="text-5xl md:text-7xl font-serif text-gray-900 mb-8 block" />
          <EditableText id="courses_catalog_desc" tag="p" defaultText="Every program is Trade Testing Board (TTB) certified and designed for market mastery." className="text-gray-500 max-w-2xl mx-auto text-xl leading-relaxed block" />
        </header>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-24">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === cat ? 'bg-teal-700 text-white shadow-xl scale-105' : 'bg-white text-gray-500 hover:bg-teal-50 border border-gray-100 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 items-start">
          {filtered.map(course => (
            <div key={course.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full hover:scale-[1.02]">
              <div className="h-56 overflow-hidden relative">
                <EditableImage 
                   id={`course_catalog_img_${course.id}`} 
                   defaultSrc={course.image} 
                   alt={course.title} 
                   className="w-full h-full group-hover:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                   <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${course.status === 'scheduled' ? 'bg-amber-500/90 text-white' : 'bg-teal-600/90 text-white'}`}>
                      {course.status}
                   </span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full block">{course.category}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 px-3 py-1 rounded-full block">{course.duration}</span>
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mb-4 leading-tight block">{course.title}</h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">{course.description}</p>
                
                {/* Curriculum Section */}
                {course.contents && course.contents.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Core Curriculum</p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.contents.map((item, i) => (
                        <span key={i} className="text-[8px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <Link 
                    to={`/admission`} 
                    className="w-full py-4 bg-gray-950 text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg active:scale-95"
                  >
                    Enroll in Program
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
