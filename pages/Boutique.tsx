
import React, { useState, useEffect } from 'react';
import { mockAuth } from '../services/authService';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { Product } from '../types';

const ProductGallery: React.FC<{ product: Product, onClose: () => void }> = ({ product, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-teal-50/98 backdrop-blur-xl animate-fade-in no-print overflow-y-auto">
      <button 
        onClick={onClose} 
        className="absolute top-6 md:top-10 right-6 md:right-10 text-neutral-400 hover:text-teal-700 transition-colors z-[210] p-2 md:p-4 group"
      >
        <svg className="w-8 h-8 md:w-10 md:h-10 transform group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" strokeWidth="1"/>
        </svg>
      </button>

      <div className="w-full h-full flex flex-col lg:flex-row p-4 sm:p-6 md:p-20 gap-8 md:gap-20">
        <div className="flex-grow relative flex items-center justify-center overflow-hidden h-[50vh] lg:h-full mt-12 lg:mt-0">
          <div className="w-full h-full relative flex items-center justify-center group">
            <img 
              src={images[activeIndex]} 
              className="max-w-full max-h-full object-contain transition-all duration-700 animate-scale-in shadow-2xl rounded-2xl" 
              alt={product.name} 
            />
            
            {images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500">
                <button onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} className="p-4 md:p-6 bg-white/80 hover:bg-white text-teal-950 rounded-full shadow-lg backdrop-blur-sm transition-all"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="1.5"/></svg></button>
                <button onClick={() => setActiveIndex((activeIndex + 1) % images.length)} className="p-4 md:p-6 bg-white/80 hover:bg-white text-teal-950 rounded-full shadow-lg backdrop-blur-sm transition-all"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="1.5"/></svg></button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[450px] flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-teal-100 pt-8 lg:pt-0 lg:pl-20 pb-8 lg:pb-0">
           <div className="mb-8 md:mb-10">
             <span className="text-teal-700 font-bold tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-3 md:mb-4 block">Atelier Showcase</span>
             <h3 className="text-4xl md:text-7xl font-serif text-neutral-900 mb-4 md:mb-6 leading-tight">{product.name}</h3>
             <p className="text-neutral-500 font-light text-base md:text-lg leading-relaxed italic mb-6 md:mb-8">{product.description}</p>
             <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
               <span className="text-xl md:text-2xl font-serif text-teal-800">{product.price}</span>
               <span className="h-px w-8 md:w-12 bg-teal-200"></span>
               <span className="text-[8px] md:text-[10px] font-black tracking-widest text-neutral-400 uppercase">{product.category === 'Digital' ? 'Fragrance' : product.category === 'Textile' ? 'Couture' : product.category}</span>
             </div>
           </div>

           <button onClick={() => alert('Our atelier will contact you for measurement and shipping specifications.')} className="w-full py-4 md:py-6 bg-neutral-900 text-white rounded-none font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-teal-800 transition-all shadow-xl">Inquire / Custom Order</button>
        </div>
      </div>
    </div>
  );
};

const Boutique: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'All' | 'Textile' | 'Handcrafted' | 'Digital'>('All');
  const [activeGalleryProduct, setActiveGalleryProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockAuth.getBoutiqueProducts().then(data => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);
  
  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="w-12 h-12 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-teal-50/20 min-h-screen pb-20 md:pb-32 overflow-x-hidden">
      <section className="relative min-h-[60vh] md:min-h-screen flex items-center bg-teal-50/30 overflow-hidden pt-16 md:pt-20 pb-12 md:pb-0">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 items-center gap-12 md:gap-20">
          <div className="lg:col-span-6 z-10">
            <EditableText id="boutique_luxury_badge" defaultText="The AK Luxury Atelier" className="text-teal-700 font-bold uppercase tracking-[0.5em] text-[8px] md:text-[10px] block mb-6 md:mb-10" />
            <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-serif text-neutral-900 mb-8 md:mb-12 leading-[1.1] md:leading-[0.8] tracking-tighter">Sale <br/><span className="italic text-teal-600">Point</span></h1>
            <div className="max-w-md border-l-2 md:border-l border-teal-900 pl-4 md:pl-10 pt-2 md:pt-4">
              <p className="text-lg md:text-xl text-neutral-500 italic font-light leading-relaxed block">
                Shopping with us is an appreciation to the skillful women and artisanal excellence.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 relative h-[350px] sm:h-[550px] md:h-[850px]">
            <div className="absolute top-0 right-0 w-full sm:w-[85%] h-full sm:h-[95%] overflow-hidden shadow-[0_50px_100px_-20px_rgba(13,148,136,0.15)] rounded-[2.5rem] md:rounded-[3rem]">
              <EditableImage id="boutique_hero_main" defaultSrc="https://images.unsplash.com/photo-1594463750939-ebb6bd2d233e?fm=webp&q=80&w=1200" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      <section id="collection-grid" className="py-8 md:py-16 bg-white/90 sticky top-[60px] md:top-[72px] z-40 border-b border-teal-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-6 sm:gap-12 lg:gap-24">
          {[
            { label: 'All', value: 'All' },
            { label: 'Couture', value: 'Textile' },
            { label: 'Handcrafted', value: 'Handcrafted' },
            { label: 'Fragrance', value: 'Digital' }
          ].map((cat) => (
            <button 
              key={cat.value} 
              onClick={() => setFilter(cat.value as any)} 
              className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] transition-all relative py-2 ${filter === cat.value ? 'text-teal-700 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-teal-700' : 'text-neutral-400 hover:text-rose-900'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 md:gap-y-24 gap-x-10 md:gap-x-16">
            {filteredProducts.map((product) => {
              return (
                <div key={product.id} className="group flex flex-col">
                  <div 
                    className="relative aspect-[3/4] overflow-hidden mb-6 md:mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700 cursor-zoom-in rounded-[2rem] bg-teal-50" 
                    onClick={() => setActiveGalleryProduct(product)}
                  >
                     <div className="w-full h-full overflow-hidden">
                        <img 
                          src={product.image} 
                          className="w-full h-full object-cover transform transition-transform duration-[3s] group-hover:scale-110" 
                          alt={product.name} 
                        />
                     </div>
                     <div className="absolute top-6 md:top-8 right-6 md:right-8">
                        <span className="text-[7px] md:text-[9px] font-black text-white bg-neutral-900/60 backdrop-blur-md px-4 md:px-5 py-1.5 md:py-2 rounded-full tracking-widest uppercase">
                          {product.category === 'Digital' ? 'Fragrance' : product.category === 'Textile' ? 'Couture' : product.category}
                        </span>
                     </div>
                  </div>
                  <div className="flex flex-col justify-between items-start gap-3 px-2">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xl md:text-2xl font-serif text-neutral-900 block">{product.name}</h3>
                        <p className="text-teal-800 font-serif text-base md:text-lg block font-bold">{product.price}</p>
                      </div>
                      <p className="text-[11px] md:text-xs text-neutral-400 font-light italic leading-relaxed block max-w-xs">{product.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      <div className="fixed top-1/2 left-0 w-64 h-64 bg-teal-200/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-100/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
};

export default Boutique;
