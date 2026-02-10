
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { COURSES, BOUTIQUE_PRODUCTS, TESTIMONIALS } from '../constants';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCourses = COURSES.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = BOUTIQUE_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStories = TESTIMONIALS.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.story.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = query.length > 0 && (filteredCourses.length > 0 || filteredProducts.length > 0 || filteredStories.length > 0);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white animate-fade-in no-print">
      <div className="p-6 md:p-10 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-grow max-w-4xl mx-auto">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search courses, products, stories..." 
            className="w-full text-2xl md:text-4xl font-serif outline-none placeholder:text-gray-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button onClick={onClose} className="p-4 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-rose-500">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto bg-gray-50/50 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {!query && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">Awaiting Entry</p>
              <h3 className="text-2xl font-serif text-gray-300 mt-4 italic">Type to begin institutional search...</h3>
            </div>
          )}

          {query && !hasResults && (
            <div className="py-20 text-center">
               <p className="text-rose-500 font-black uppercase tracking-widest text-xs">No Results</p>
               <h3 className="text-2xl font-serif text-gray-400 mt-4 italic">Your query did not match any active records.</h3>
            </div>
          )}

          {query && hasResults && (
            <div className="space-y-16">
              {filteredCourses.length > 0 && (
                <section>
                  <h4 className="text-[10px] font-black text-teal-700 uppercase tracking-[0.4em] mb-8 border-b border-teal-100 pb-4">Academic Programs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses.map(course => (
                      <Link key={course.id} to="/courses" onClick={onClose} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={course.image} className="w-full h-full object-cover" alt={course.title} />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{course.title}</h5>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{course.duration} Certification</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {filteredProducts.length > 0 && (
                <section>
                  <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-[0.4em] mb-8 border-b border-rose-100 pb-4">Boutique Atelier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map(product => (
                      <Link key={product.id} to="/boutique" onClick={onClose} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 group-hover:text-rose-700 transition-colors">{product.name}</h5>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{product.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {filteredStories.length > 0 && (
                <section>
                  <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.4em] mb-8 border-b border-amber-100 pb-4">Student Stories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStories.map(story => (
                      <Link key={story.id} to="/stories" onClick={onClose} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={story.image} className="w-full h-full object-cover" alt={story.name} />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{story.name}</h5>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{story.course} Graduate</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
