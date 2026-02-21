const { useState, useEffect } = React;

const App = () => {
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewingProduct, setViewingProduct] = useState(null);
    const whatsappNumber = "9199171xxxxx"; // Replace with your number

    useEffect(() => {
        fetch('data/products.json?v=' + Date.now())
            .then(res => {
                if (!res.ok) throw new Error("File not found");
                return res.json();
            })
            .then(data => {
                // Ensure data is always an array so .filter() doesn't crash
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Critical Error:", err);
                setProducts([]); // Fallback to empty list instead of crashing
            });
    }, []);

    useEffect(() => { if (window.lucide) lucide.createIcons(); }, [products, viewingProduct]);

    const handleWhatsApp = (p) => {
        const msg = `Hi HazzaleBlue, I'm interested in: ${p.name}\nPrice: ${p.price}\nLink: ${window.location.href}?item=${p.id}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const categories = ['All', 'Cameras', 'Tabs', 'Hardrives', 'CCTV'];
    const filtered = products.filter(p => activeCategory === 'All' || p.category === activeCategory);

    return (
        <div className="min-h-screen p-6">
            {/* Header / Navigation */}
            <nav className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <h1 className="text-3xl font-black italic tracking-tighter text-blue-500 uppercase">HAZZALE BLUE</h1>
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setViewingProduct(null); }}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto">
                {viewingProduct ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={() => setViewingProduct(null)} className="mb-8 font-black text-[10px] uppercase text-slate-500 hover:text-white flex items-center gap-2">
                             <i data-lucide="arrow-left" className="w-4 h-4"></i> Back to Gallery
                        </button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-800/50 p-8 rounded-[3rem] border border-slate-700">
                            <div className="bg-white rounded-[2rem] p-8 flex items-center justify-center">
                                <img src={viewingProduct.images[0]} className="max-h-[500px] w-auto object-contain" />
                            </div>
                            <div className="flex flex-col justify-center space-y-6">
                                <h2 className="text-5xl font-black italic uppercase leading-none">{viewingProduct.name}</h2>
                                <div className="flex items-center gap-4">
                                    <p className="text-4xl font-black text-blue-500">{viewingProduct.price}</p>
                                    {!viewingProduct.inStock && <span className="bg-red-600 px-4 py-1 rounded-full text-[10px] font-black italic uppercase">Sold Out</span>}
                                </div>
                                <p className="text-slate-400 leading-relaxed text-lg">{viewingProduct.details}</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.length > 0 ? filtered.map(p => (
                            <div key={p.id} onClick={() => setViewingProduct(p)} className="group bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 p-6 cursor-pointer hover:border-blue-500/50 transition-all">
                                <div className="aspect-square bg-white rounded-3xl mb-6 p-6 overflow-hidden relative flex items-center justify-center">
                                    <img src={p.images[0]} className="max-h-full w-auto object-contain group-hover:scale-110 transition duration-700" />
                                    {!p.inStock && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center font-black text-white italic text-xs uppercase tracking-widest">Out of Stock</div>}
                                </div>
                                <div className="px-2">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{p.category}</p>
                                    <h4 className="text-xl font-black italic mb-2 uppercase truncate">{p.name}</h4>
                                    <p className="text-2xl font-black text-white">{p.price}</p>
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