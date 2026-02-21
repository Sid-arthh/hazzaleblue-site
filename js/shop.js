const { useState, useEffect } = React;

const SUPABASE_URL = 'https://fpgamsphgwyramtopbdl.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_t5Dro1BgG8sMUpQyMWiE0Q_BxjDTBrn';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const App = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 12 items perfectly fill wide desktop grids
    const whatsappNumber = "918800776882";

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data, error } = await supabaseClient.from('products').select('*').order('id', { ascending: false });
            if (!error) {
                setProducts(data || []);
                const urlParams = new URLSearchParams(window.location.search);
                const productId = urlParams.get('id');
                if (productId && data) {
                    const directProduct = data.find(item => item.id == productId);
                    if (directProduct) { setViewingProduct(directProduct); setMainImage(directProduct.images[0]); }
                }
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    useEffect(() => { if (window.lucide) lucide.createIcons(); }, [products, viewingProduct, searchQuery, isMenuOpen, loading, sortBy, currentPage]);

    const filteredAndSorted = products
        .filter(p => (activeCategory === 'All' || p.category === activeCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'name-az') return a.name.localeCompare(b.name);
            if (sortBy === 'price-low') return parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''));
            if (sortBy === 'price-high') return parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, ''));
            return b.id - a.id; 
        });

    const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const currentItems = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleShare = async (p) => {
        const url = `${window.location.origin}${window.location.pathname}?id=${p.id}`;
        if (navigator.share) { await navigator.share({ title: p.name, url }); }
        else { navigator.clipboard.writeText(url); alert("Link Copied!"); }
    };

    const categories = ['All', 'Cameras', 'HDD', 'CCTV', 'Phones', 'Tabs', 'Speakers', 'Covers'];

    const navItems = [
        { name: 'Home', url: 'index.html' },
        { name: 'About Us', url: 'about.html' },
        { name: 'Contact Us', url: 'contact.html' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white antialiased">
            
            {/* --- FULL SCREEN MOBILE MENU --- */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-[#020617]/98 backdrop-blur-2xl p-8 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300">
                    <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-4 bg-slate-900 rounded-full border border-slate-800 text-blue-500 hover:rotate-90 transition-transform">
                        <i data-lucide="x" className="w-8 h-8"></i>
                    </button>
                    <nav className="max-w-4xl mx-auto w-full space-y-4">
                        {navItems.map((item, i) => (
                            <a key={item.name} href={item.url} className="group flex items-center gap-6 w-full text-left py-4 border-b border-slate-800/50 hover:border-blue-500 transition-all">
                                <span className="text-slate-600 font-black italic text-xl">0{i+1}</span>
                                <span className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter group-hover:text-blue-500 group-hover:translate-x-4 transition-all duration-300">{item.name}</span>
                            </a>
                        ))}
                    </nav>
                </div>
            )}

            {/* --- EDGE-TO-EDGE HEADER --- */}
            <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 px-6 lg:px-12 py-4">
                <div className="w-full mx-auto flex items-center justify-between gap-8">
                    
                    {/* Corner Left: Logo */}
                    <div className="w-1/4">
                        <a href="index.html" className="text-2xl lg:text-3xl font-black italic tracking-tighter text-blue-500 uppercase">HAZZALE BLUE</a>
                    </div>

                    {/* Center: Search Bar (Hidden on tiny phones, wide on PC) */}
                    <div className="hidden sm:flex flex-grow justify-center w-1/2">
                        {!viewingProduct && (
                            <div className="relative w-full max-w-2xl">
                                <input type="text" placeholder="Search for products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-full py-3 px-12 text-sm font-bold focus:border-blue-500 outline-none transition-all focus:shadow-[0_0_20px_rgba(59,130,246,0.15)]"/>
                                <i data-lucide="search" className="w-5 h-5 absolute left-5 top-3.5 text-slate-500"></i>
                            </div>
                        )}
                    </div>

                    {/* Corner Right: Desktop Links & Menu Button */}
                    <div className="w-1/4 flex items-center justify-end gap-6">
                        {/* Desktop Links (Hidden on mobile) */}
                        <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <a href="about.html" className="hover:text-blue-500 hover:-translate-y-0.5 transition-transform duration-300">About</a>
                            <a href="contact.html" className="hover:text-blue-500 hover:-translate-y-0.5 transition-transform duration-300">Contact</a>
                        </div>
                        
                        {/* Hamburger Button */}
                        <button onClick={() => setIsMenuOpen(true)} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-blue-500 hover:text-white hover:bg-slate-800 transition-all shrink-0">
                            <i data-lucide="menu" className="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN FLUID CONTENT --- */}
            <main className="w-full mx-auto px-6 lg:px-12 py-12">
                
                {/* Product Gallery View */}
                {!viewingProduct && (
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 animate-in fade-in duration-500">
                        
                        {/* Left Sidebar */}
                        <aside className="w-full lg:w-80 shrink-0 order-1 space-y-8">
                            <div className="bg-slate-900/50 border border-slate-800 p-6 lg:p-8 rounded-[2rem] sticky top-32 shadow-xl">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6">Categories</h3>
                                
                                {/* Scrollable Category Buttons */}
                                <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] no-scrollbar mb-8 pb-3 lg:pb-0">
                                    {categories.map(cat => (
                                        <button key={cat} onClick={() => {setActiveCategory(cat); setCurrentPage(1);}} className={`shrink-0 px-6 py-4 lg:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="pt-8 border-t border-slate-800">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Sort Gallery</h3>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-3 text-[10px] font-bold outline-none focus:border-blue-500 cursor-pointer">
                                        <option value="newest">Newest First</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="name-az">Name: A to Z</option>
                                    </select>
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid (Expands to fill screen) */}
                        <div className="flex-grow order-2 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 lg:gap-10">
                                {currentItems.map(p => (
                                    <div key={p.id} onClick={() => {setViewingProduct(p); setMainImage(p.images[0]);}} className="group flex flex-col bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 p-6 cursor-pointer hover:border-blue-600 transition-all shadow-xl hover:shadow-blue-900/20">
                                        <div className="aspect-square bg-white rounded-3xl mb-6 p-8 flex items-center justify-center overflow-hidden relative shadow-inner">
                                            <img src={p.images[0] || ''} className="max-h-full w-auto object-contain group-hover:scale-110 transition duration-700" />
                                            {!p.in_stock && <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center font-black text-white italic text-[10px] uppercase tracking-[0.4em] backdrop-blur-sm">Sold Out</div>}
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{p.category}</p>
                                            <h4 className="text-lg font-black italic mb-3 uppercase line-clamp-2 group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                            <p className="text-2xl lg:text-3xl font-black text-white mt-auto">{p.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-4 mt-16 lg:mt-20">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 disabled:opacity-20 hover:bg-slate-800 transition-colors"><i data-lucide="chevron-left"></i></button>
                                    <span className="flex items-center font-black italic uppercase text-[10px] tracking-widest text-slate-500">Page {currentPage} of {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 disabled:opacity-20 hover:bg-slate-800 transition-colors"><i data-lucide="chevron-right"></i></button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- PRODUCT DETAIL VIEW --- */}
                {viewingProduct && (
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <button onClick={() => setViewingProduct(null)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"><i data-lucide="arrow-left" className="w-4 h-4"></i> Back to Gallery</button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-slate-900/50 p-6 sm:p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
                            <div className="space-y-6">
                                <div className="bg-white rounded-[2rem] p-10 flex items-center justify-center shadow-inner relative group cursor-zoom-in" onClick={() => window.open(mainImage || viewingProduct.images[0], '_blank')}>
                                    <img src={mainImage || viewingProduct.images[0]} className="max-h-[500px] xl:max-h-[700px] w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                    {viewingProduct.images.map((img, i) => (
                                        <div key={i} onClick={() => setMainImage(img)} className={`cursor-pointer rounded-2xl p-2 w-24 h-24 shrink-0 flex items-center justify-center overflow-hidden border-2 transition-all ${mainImage === img ? 'border-blue-500 bg-blue-50' : 'border-slate-800 bg-white hover:border-slate-400'}`}>
                                            <img src={img} className="max-h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center space-y-8 lg:px-8">
                                <div><p className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-3">{viewingProduct.category}</p>
                                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black italic uppercase leading-tight tracking-tighter">{viewingProduct.name}</h2></div>
                                <p className="text-5xl lg:text-6xl font-black text-white">{viewingProduct.price}</p>
                                <p className="text-slate-400 leading-relaxed text-lg lg:text-2xl italic border-l-2 border-slate-800 pl-6">{viewingProduct.details}</p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                                    <button onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Interested in " + viewingProduct.name)}`, '_blank')} className="flex-grow py-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] font-black text-sm uppercase flex items-center justify-center gap-3 shadow-xl"><i data-lucide="message-circle"></i> WhatsApp Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);