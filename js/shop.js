const { useState, useEffect } = React;

const App = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const whatsappNumber = "918800776882"; // Updated to correct client number

    // Fetch products with cache-busting
    useEffect(() => {
        setLoading(true);
        fetch('data/products.json?v=' + Date.now())
            .then(res => {
                if (!res.ok) throw new Error("File not found");
                return res.json();
            })
            .then(data => {
                setProducts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Critical Error:", err);
                setProducts([]);
                setLoading(false);
            });
    }, []);

    // Initialize Lucide icons whenever the UI shifts
    useEffect(() => { 
        if (window.lucide) lucide.createIcons(); 
    }, [products, viewingProduct, searchQuery, isMenuOpen, loading]);

    const handleWhatsApp = (p) => {
        const message = `Hi HazzaleBlue, I'm interested in buying:\n\nItem: ${p.name}\nPrice: ${p.price}\nLink: ${window.location.href}`;
        const finalUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(finalUrl, '_blank');
    };

    const categories = ['All', 'Cameras', 'Tabs', 'Hardrives', 'CCTV'];
    
    // Combined Category + Search Filter
    const filtered = products.filter(p => {
        if (!p) return false;
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen p-4 md:p-8">
            <nav className="max-w-7xl mx-auto mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black italic text-blue-500 uppercase tracking-tighter">HAZZALE BLUE</h1>
                    
                    <div className="flex items-center gap-4">
                        {/* Desktop Search Bar */}
                        <div className="hidden md:flex relative w-64">
                            <input 
                                type="text" 
                                placeholder="SEARCH..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-10 text-[10px] font-black focus:border-blue-500 outline-none transition-all"
                            />
                            <i data-lucide="search" className="w-4 h-4 absolute left-4 top-3.5 text-slate-500"></i>
                        </div>

                        {/* Mobile Toggle Button (≡) */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-3 bg-slate-800 rounded-xl text-blue-500">
                            <i data-lucide={isMenuOpen ? "x" : "menu"} className="w-6 h-6"></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden mb-6 relative">
                    <input 
                        type="text" 
                        placeholder="SEARCH PRODUCTS..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 px-12 text-[10px] font-black focus:border-blue-500 outline-none"
                    />
                    <i data-lucide="search" className="w-5 h-5 absolute left-4 top-4 text-slate-500"></i>
                </div>

                {/* Navigation Categories */}
                <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300`}>
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => { setActiveCategory(cat); setIsMenuOpen(false); setViewingProduct(null); }}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto">
                {/* 1. Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-500">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-black italic uppercase text-xs tracking-[0.3em] text-slate-500">Fetching Inventory...</p>
                    </div>
                ) : viewingProduct ? (
                    /* 2. Single Product View */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={() => setViewingProduct(null)} className="mb-8 font-black text-[10px] uppercase text-slate-500 hover:text-white flex items-center gap-2">
                             <i data-lucide="arrow-left" className="w-4 h-4"></i> Back to Gallery
                        </button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-800/50 p-8 rounded-[3rem] border border-slate-700">
                            <div className="bg-white rounded-[2rem] p-8 flex items-center justify-center">
                                <img 
                                    src={viewingProduct.images && viewingProduct.images[0] ? viewingProduct.images[0] : 'https://via.placeholder.com/600x400?text=No+Image'} 
                                    className="max-h-[500px] w-auto object-contain" 
                                />
                            </div>
                            <div className="flex flex-col justify-center space-y-6">
                                <h2 className="text-5xl font-black italic uppercase leading-none">{viewingProduct.name || "Unnamed Product"}</h2>
                                <div className="flex items-center gap-4">
                                    <p className="text-4xl font-black text-blue-500">{viewingProduct.price || "N/A"}</p>
                                    {!viewingProduct.inStock && <span className="bg-red-600 px-4 py-1 rounded-full text-[10px] font-black italic uppercase">Sold Out</span>}
                                </div>
                                <p className="text-slate-400 leading-relaxed text-lg">{viewingProduct.details || "No description available."}</p>
                                <button 
                                    disabled={!viewingProduct.inStock} 
                                    onClick={() => handleWhatsApp(viewingProduct)} 
                                    className={`w-full py-6 rounded-2xl font-black text-sm tracking-widest uppercase transition-all ${viewingProduct.inStock ? 'bg-[#25D366] hover:scale-[1.02] shadow-xl' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}
                                >
                                    {viewingProduct.inStock ? 'Order on WhatsApp' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 3. Product Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.length > 0 ? filtered.map(p => (
                            <div key={p.id} onClick={() => setViewingProduct(p)} className="group bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 p-6 cursor-pointer hover:border-blue-500/50 transition-all">
                                <div className="aspect-square bg-white rounded-3xl mb-6 p-6 overflow-hidden relative flex items-center justify-center">
                                    <img 
                                        src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/300?text=No+Image'} 
                                        className="max-h-full w-auto object-contain group-hover:scale-110 transition duration-700" 
                                    />
                                    {!p.inStock && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center font-black text-white italic text-xs uppercase tracking-widest text-center">Out of Stock</div>}
                                </div>
                                <div className="px-2">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{p.category || "General"}</p>
                                    <h4 className="text-xl font-black italic mb-2 uppercase truncate">{p.name || "Untitled Item"}</h4>
                                    <p className="text-2xl font-black text-white">{p.price || "N/A"}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center opacity-20">
                                <i data-lucide="package-search" className="w-20 h-20 mx-auto mb-4"></i>
                                <p className="font-black uppercase tracking-[0.5em]">No products found</p>
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