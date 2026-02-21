const { useState, useEffect } = React;

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
    const [copied, setCopied] = useState(false);
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
                    if (directProduct) setViewingProduct(directProduct);
                }
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    useEffect(() => { if (window.lucide) lucide.createIcons(); }, [products, viewingProduct, searchQuery, isMenuOpen, loading, copied]);

    const getDeepLink = (id) => `${window.location.origin}${window.location.pathname}?id=${id}`;

    const handleWhatsApp = (p) => {
        const msg = `Hi HazzaleBlue, I'm interested in: ${p.name}\nPrice: ${p.price}\nLink: ${getDeepLink(p.id)}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // New: Native Share / Copy Fallback
    const handleShare = async (p) => {
        const shareData = {
            title: p.name,
            text: `Check out this ${p.name} on Hazzale Blue!`,
            url: getDeepLink(p.id),
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share cancelled or failed");
            }
        } else {
            // Fallback for desktop
            navigator.clipboard.writeText(shareData.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const categories = ['All', 'Cameras', 'Tabs', 'Hardrives', 'CCTV'];
    const filtered = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#020617] text-white antialiased">
            <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase cursor-pointer" 
                        onClick={() => {setViewingProduct(null); window.history.pushState({}, '', window.location.pathname);}}>
                        HAZZALE BLUE
                    </h1>
                    <div className="hidden lg:flex items-center gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => {setActiveCategory(cat); setViewingProduct(null);}}
                                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 flex-grow max-w-xs justify-end">
                        <div className="relative w-full hidden sm:block">
                            <input type="text" placeholder="SEARCH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 px-10 text-[10px] font-bold focus:border-blue-500 outline-none"/>
                            <i data-lucide="search" className="w-4 h-4 absolute left-4 top-2.5 text-slate-500"></i>
                        </div>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-blue-500">
                            <i data-lucide={isMenuOpen ? "x" : "menu"} className="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : viewingProduct ? (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <button onClick={() => {setViewingProduct(null); window.history.pushState({}, '', window.location.pathname);}} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white">
                            <i data-lucide="arrow-left" className="w-4 h-4"></i> Back to Gallery
                        </button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
                            <div className="space-y-4">
                                <div className="bg-white rounded-[2rem] p-10 flex items-center justify-center shadow-inner relative">
                                    <img src={viewingProduct.images && viewingProduct.images[0] ? viewingProduct.images[0] : ''} className="max-h-[500px] w-auto object-contain" />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {viewingProduct.images && viewingProduct.images.slice(1).map((img, i) => (
                                        <div key={i} className="bg-white rounded-xl p-2 aspect-square flex items-center justify-center overflow-hidden border border-slate-800">
                                            <img src={img} className="max-h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center space-y-8">
                                <div><p className="text-blue-500 font-black text-xs uppercase mb-3">{viewingProduct.category}</p>
                                <h2 className="text-5xl font-black italic uppercase leading-none tracking-tighter">{viewingProduct.name}</h2></div>
                                <p className="text-5xl font-black text-white">{viewingProduct.price}</p>
                                <p className="text-slate-400 leading-relaxed text-lg italic border-l-2 border-slate-800 pl-6">{viewingProduct.details}</p>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => handleWhatsApp(viewingProduct)} className="flex-grow py-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] font-black text-sm uppercase flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#25D366]/20">
                                        <i data-lucide="message-circle" className="w-5 h-5"></i> Order on WhatsApp
                                    </button>
                                    {/* Native Share Button */}
                                    <button onClick={() => handleShare(viewingProduct)} className={`px-8 py-6 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-3 transition-all border ${copied ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                                        <i data-lucide={copied ? "check" : "share-2"} className="w-5 h-5"></i>
                                        <span>{copied ? 'Copied' : 'Share'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filtered.map(p => (
                            <div key={p.id} onClick={() => {setViewingProduct(p); window.history.pushState({}, '', `?id=${p.id}`);}} className="group bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 p-6 cursor-pointer hover:border-blue-600 transition-all duration-500">
                                <div className="aspect-square bg-white rounded-3xl mb-8 p-8 flex items-center justify-center overflow-hidden relative shadow-inner">
                                    <img src={p.images && p.images[0] ? p.images[0] : ''} className="max-h-full w-auto object-contain group-hover:scale-110 transition duration-700" />
                                    {!p.in_stock && <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center font-black text-white italic text-[10px] uppercase tracking-[0.4em] backdrop-blur-sm">Sold Out</div>}
                                </div>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{p.category}</p>
                                <h4 className="text-xl font-black italic mb-3 uppercase truncate group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                <p className="text-3xl font-black text-white">{p.price}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);