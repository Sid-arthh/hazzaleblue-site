const { useState, useEffect } = React;

// 1. INITIALIZE SUPABASE CLIENT
// Replace these with the values from your Supabase Project Settings > API
const SUPABASE_URL = 'https://fpgamsphgwyramtopbdl.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_t5Dro1BgG8sMUpQyMWiE0Q_BxjDTBrn';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const App = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const whatsappNumber = "918800776882"; // Updated client number

    // 2. FETCH DATA FROM SUPABASE
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('id', { ascending: false }); // Show newest first

            if (error) {
                console.error("Supabase Error:", error.message);
                setProducts([]);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    // 3. RE-INITIALIZE ICONS
    useEffect(() => { 
        if (window.lucide) lucide.createIcons(); 
    }, [products, viewingProduct, searchQuery, isMenuOpen, loading]);

    const handleWhatsApp = (p) => {
        const msg = `Hi HazzaleBlue, I'm interested in: ${p.name}\nPrice: ${p.price}\nLink: ${window.location.href}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const categories = ['All', 'Cameras', 'Tabs', 'Hardrives', 'CCTV'];
    
    // 4. FILTERING LOGIC (CATEGORY + SEARCH)
    const filtered = products.filter(p => {
        if (!p) return false;
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#020617] text-white antialiased selection:bg-blue-500/30">
            {/* --- PREMIUM HEADER --- */}
            <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase shrink-0">
                        HAZZALE BLUE
                    </h1>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => {setActiveCategory(cat); setViewingProduct(null);}}
                                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search & Toggle Area */}
                    <div className="flex items-center gap-3 flex-grow max-w-xs justify-end">
                        <div className="relative w-full hidden sm:block">
                            <input type="text" placeholder="SEARCH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 px-10 text-[10px] font-bold focus:border-blue-500 outline-none transition-all"/>
                            <i data-lucide="search" className="w-4 h-4 absolute left-4 top-2.5 text-slate-500"></i>
                        </div>
                        
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-blue-500">
                            <i data-lucide={isMenuOpen ? "x" : "menu"} className="w-6 h-6"></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => {setActiveCategory(cat); setIsMenuOpen(false); setViewingProduct(null);}}
                                className={`flex-grow px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeCategory === cat ? 'bg-blue-600' : 'bg-slate-900 text-slate-400'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Syncing Database</p>
                    </div>
                ) : viewingProduct ? (
                    /* --- SINGLE PRODUCT VIEW --- */
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <button onClick={() => setViewingProduct(null)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                            <i data-lucide="arrow-left" className="w-4 h-4"></i> Back to Gallery
                        </button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
                            <div className="bg-white rounded-[2rem] p-10 flex items-center justify-center">
                                <img src={viewingProduct.images && viewingProduct.images[0] ? viewingProduct.images[0] : 'https://via.placeholder.com/600x600?text=No+Image'} 
                                     className="max-h-[500px] w-auto object-contain transition-transform duration-700 hover:scale-105" />
                            </div>
                            <div className="flex flex-col justify-center space-y-8">
                                <div>
                                    <p className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-3">{viewingProduct.category}</p>
                                    <h2 className="text-5xl font-black italic uppercase leading-none tracking-tighter">{viewingProduct.name}</h2>
                                </div>
                                <div className="flex items-center gap-6">
                                    <p className="text-5xl font-black text-white">{viewingProduct.price}</p>
                                    {!viewingProduct.in_stock && <span className="bg-red-600 px-5 py-1.5 rounded-full text-[10px] font-black uppercase italic">Sold Out</span>}
                                </div>
                                <p className="text-slate-400 leading-relaxed text-lg italic border-l-2 border-slate-800 pl-6">{viewingProduct.details}</p>
                                <button disabled={!viewingProduct.in_stock} onClick={() => handleWhatsApp(viewingProduct)} 
                                    className={`w-full py-6 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 ${viewingProduct.in_stock ? 'bg-[#25D366] hover:bg-[#20ba5a] hover:scale-[1.02] shadow-xl shadow-[#25D366]/20' : 'bg-slate-800 opacity-50 cursor-not-allowed'}`}>
                                    <i data-lucide="message-circle" className="w-5 h-5"></i>
                                    <span>{viewingProduct.in_stock ? 'Order on WhatsApp' : 'Out of Stock'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- PRODUCT GRID --- */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filtered.length > 0 ? filtered.map(p => (
                            <div key={p.id} onClick={() => setViewingProduct(p)} className="group bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 p-6 cursor-pointer hover:border-blue-600/50 hover:bg-slate-900 transition-all duration-500 shadow-xl">
                                <div className="aspect-square bg-white rounded-3xl mb-8 p-8 overflow-hidden relative flex items-center justify-center shadow-inner">
                                    <img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400x400?text=Syncing...'} 
                                         className="max-h-full w-auto object-contain group-hover:scale-110 transition duration-700" />
                                    {!p.in_stock && <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center font-black text-white italic text-[10px] uppercase tracking-[0.4em] backdrop-blur-sm">Sold Out</div>}
                                </div>
                                <div className="px-2">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">{p.category}</p>
                                    <h4 className="text-xl font-black italic mb-3 uppercase truncate tracking-tighter group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                    <p className="text-3xl font-black text-white">{p.price}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-40 text-center">
                                <i data-lucide="package-search" className="w-12 h-12 text-slate-800 mx-auto mb-4"></i>
                                <p className="font-black uppercase tracking-[0.6em] text-slate-700 text-xs">No Items Found</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);