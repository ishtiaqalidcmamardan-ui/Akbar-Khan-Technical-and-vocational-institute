
import { Course, Testimonial, Product, Achievement } from './types';

export const INSTITUTION_LINE_1 = "Akbar Khan Technical and";
export const INSTITUTION_LINE_2 = "Vocational Institute (Regd. TTB)";
export const INSTITUTION_NAME = `${INSTITUTION_LINE_1} ${INSTITUTION_LINE_2}`;
export const INSTITUTION_TAG = "(Regd. TTB)";

export const GALLERY_ASSETS = [
  {
    id: 'g1',
    src: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?fm=webp&fit=crop&q=80&w=1600',
    title: 'Academic Frontage',
    category: 'The Building',
    span: 'lg:col-span-8 lg:row-span-2'
  },
  {
    id: 'g2',
    src: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?fm=webp&fit=crop&q=80&w=800',
    title: 'Textile Design Lab',
    category: 'Institutional Facility',
    span: 'lg:col-span-4 lg:row-span-1'
  },
  {
    id: 'g3',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=webp&fit=crop&q=80&w=800',
    title: 'Annual Convocation',
    category: 'Academic Events',
    span: 'lg:col-span-4 lg:row-span-1'
  },
  {
    id: 'g4',
    src: 'https://images.unsplash.com/photo-1524178232457-3bb2449b382a?fm=webp&fit=crop&q=80&w=1200',
    title: 'Skill Workshop',
    category: 'Daily Operations',
    span: 'lg:col-span-4 lg:row-span-1'
  },
  {
    id: 'g5',
    src: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?fm=webp&fit=crop&q=80&w=1200',
    title: 'Digital Literacy Hub',
    category: 'IT Facilities',
    span: 'lg:col-span-8 lg:row-span-1'
  }
];

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Fashion Designing & Textile Art',
    description: 'Master the art of garment construction, design principles, and textile selection under TTB certification.',
    category: 'Vocational',
    duration: '6 Months',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?fm=webp&fit=crop&q=80&w=800',
    status: 'active',
    contents: ['Sketching & Illustration', 'Pattern Making', 'Draping', 'Textile Science', 'Embroidery & Embellishment', 'Business of Fashion']
  },
  {
    id: 2,
    title: 'Advanced Computer Skills (MS Office)',
    description: 'Comprehensive training in Word, Excel, and PowerPoint tailored for administrative and corporate excellence.',
    category: 'Technical',
    duration: '3 Months',
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?fm=webp&fit=crop&q=80&w=800',
    status: 'active',
    contents: ['MS Word (Advanced Formatting)', 'MS Excel (Data Analysis & Pivot)', 'MS PowerPoint (Premium Pitching)', 'Outlook & Communication', 'Data Entry & Typing Mastery']
  },
  {
    id: 3,
    title: 'Digital Marketing & E-Commerce',
    description: 'Learn SEO, social media management, and modern content strategy to lead in the digital economy.',
    category: 'Professional',
    duration: '4 Months',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?fm=webp&fit=crop&q=80&w=800',
    status: 'active',
    contents: ['Search Engine Optimization (SEO)', 'Social Media Management', 'Content Marketing', 'Google Ads (SEM)', 'Email Marketing', 'Affiliate Marketing & E-commerce']
  },
  {
    id: 4,
    title: 'Graphics Designing & Visual Arts',
    description: 'Adobe Suite mastery, branding, and visual communication fundamentals for future designers.',
    category: 'Technical',
    duration: '4 Months',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?fm=webp&fit=crop&q=80&w=800',
    status: 'active',
    contents: ['Adobe Photoshop Mastery', 'Adobe Illustrator Tools', 'Logo Design & Branding', 'UI/UX Fundamentals', 'Typography & Layouts', 'Print Media Design']
  }
];

export const BOUTIQUE_PRODUCTS: Product[] = [
  {
    id: 'bridal-01',
    name: 'Royal Crimson Bridal',
    description: 'Exquisite hand-embroidered Zardozi on premium silk. A timeless masterpiece for the traditional bride.',
    price: 'PKR 185,000',
    category: 'Textile',
    image: 'https://images.unsplash.com/photo-1594463750939-ebb6bd2d233e?fm=webp&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1594463750939-ebb6bd2d233e?fm=webp&q=80&w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?fm=webp&q=80&w=1200'
    ],
    isHero: true
  },
  {
    id: 'perfume-01',
    name: 'Noor-e-Kashmir Oud',
    description: 'Our signature institutional fragrance. A luxurious blend of aged sandalwood, saffron, and wild rose.',
    price: 'PKR 12,500',
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?fm=webp&q=80&w=1200',
    isHero: true
  },
  {
    id: 'dress-01',
    name: 'Ivory Grace Gown',
    description: 'Minimalist contemporary silhouette with delicate lace detailing and a flowing chiffon train.',
    price: 'PKR 45,000',
    category: 'Textile',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?fm=webp&q=80&w=1200',
    isHero: true
  },
  {
    id: 'bridal-02',
    name: 'Emerald Velvet Suite',
    description: 'Deep emerald velvet featuring intricate silver Tilla work. Perfect for high-end winter receptions.',
    price: 'PKR 65,000',
    category: 'Textile',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'perfume-02',
    name: 'Saffron Rose Essence',
    description: 'A light, ethereal feminine scent crafted by our vocational lab. Infused with pure organic extracts.',
    price: 'PKR 8,200',
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'bridal-03',
    name: 'Pearl White Nikah Ensemble',
    description: 'Elegant ivory silk adorned with white-on-white embroidery and pearl embellishments.',
    price: 'PKR 88,000',
    category: 'Textile',
    image: 'https://images.unsplash.com/photo-1549416878-b9ca35c2d47a?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'handcrafted-01',
    name: 'Artisan Zardozi Clutch',
    description: 'A handcrafted bridal accessory featuring mother-of-pearl inlay and luxury silk lining.',
    price: 'PKR 14,500',
    category: 'Handcrafted',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fd113f0d?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'dress-02',
    name: 'Midnight Floral Wrap',
    description: 'Exquisite chiffon wrap featuring hand-painted floral motifs and silk borders.',
    price: 'PKR 18,000',
    category: 'Textile',
    image: 'https://images.unsplash.com/photo-1618333234901-b35835ebbe71?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'perfume-03',
    name: 'Amber Glow Parfum',
    description: 'A warm, sophisticated unisex scent with notes of amber, leather, and vanilla bean.',
    price: 'PKR 11,000',
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'dress-03',
    name: 'Rosewater Evening Slit',
    description: 'A soft rose-toned cocktail dress with a daring slit and hand-placed crystal belt.',
    price: 'PKR 28,000',
    category: 'Textile',
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'handcrafted-02',
    name: 'Golden Bloom Earrings',
    description: 'Handcrafted metallic bloom earrings inspired by traditional Mughal motifs.',
    price: 'PKR 4,500',
    category: 'Handcrafted',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?fm=webp&q=80&w=1200',
    isHero: false
  },
  {
    id: 'perfume-04',
    name: 'Midnight Jasmine',
    description: 'The essence of night-blooming jasmine captured in a premium artisanal blend.',
    price: 'PKR 7,500',
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888bb4?fm=webp&q=80&w=1200',
    isHero: false
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    name: 'Asma Bibi',
    course: 'Fashion Designing & Textile Art',
    percentage: '96%',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?fm=webp&fit=crop&q=80&w=400',
    award: 'Gold Medal'
  },
  {
    id: 'ach-2',
    name: 'Kiran Shah',
    course: 'Advanced Computer Skills (MS Office)',
    percentage: '94%',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1548142813-c348350df52b?fm=webp&fit=crop&q=80&w=400',
    award: 'Silver Medal'
  }
];

export const EXECUTIVE_MESSAGES = {
  ceo: {
    name: "Mr. Akbar Khan",
    title: "Chief Executive Officer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&fit=crop&q=80&w=500",
    message: "Our institution was founded on the belief that skill is the ultimate currency for empowerment. We aren't just giving certificates; we are building futures for those the world often overlooks. My vision is to see every woman in our community economically independent and socially empowered."
  }
};

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Courses', path: '/courses' },
  { name: 'Sale Point', path: '/boutique' },
  { name: 'Results', path: '/results' },
  { name: 'Stories', path: '/stories' },
  { name: 'Admission', path: '/admission' },
  { name: 'LMS', path: '/lms' },
  { name: 'Donation', path: '/donate' }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sana Ahmed',
    course: 'Fashion Designing',
    story: 'Coming from a family where education for girls was not a priority, Akbar Khan Institute gave me a second chance. I learned not just how to sew, but how to design for the future.',
    impact: 'Today, I run my own small boutique and support my younger brother’s school fees.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=webp&fit=crop&q=80&w=200',
    year: 'Class of 2022'
  }
];
