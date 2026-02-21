const { useState, useEffect } = React;

const App = () => {
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewingProduct, setViewingProduct] = useState(null);
    const whatsappNumber = "9199171xxxxx"; // Replace with client number

    useEffect(() => {
        fetch('data/products.json?v=' + Date.now())
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error:", err));
    }, []);

    useEffect(() => { if (window.lucide) lucide.createIcons(); }, [products, viewingProduct]);

    const handleWhatsApp = (p) => {
        const msg = `Hi HazzaleBlue, I'm interested in: ${p.name}\nPrice: ${p.price}\nLink: ${window.location.href}?item=${p.id}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const filtered = products.filter(p => activeCategory === 'All' || p.category === activeCategory);

    return (
        <div className="min-h-screen">
            {/* Header and Nav as built before */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {viewingProduct ? (
                    <div className="animate-in fade-in duration-500">
                        <button onClick={() => setViewingProduct(null)} className="mb-8 font-bold text-xs uppercase text-slate-400">← Back</button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="bg-white rounded-[2rem] p-8"><img src={viewingProduct.images[0]} className="w-full h-auto object-contain" /></div>
                            <div className="space-y-6">
                                <h2 className="text-4xl font-black italic uppercase">{viewingProduct.name}</h2>
                                <p className="text-3xl font-black text-blue-500">{viewingProduct.price}</p>
                                {!viewingProduct.inStock && <span className="inline-block bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black">OUT OF STOCK</span>}
                                <p className="text-slate-400 italic leading-relaxed">{viewingProduct.details}</p>
                                <button disabled={!viewingProduct.inStock} onClick={() => handleWhatsApp(viewingProduct)} className={`w-full py-5 rounded-2xl font-black text-xs ${viewingProduct.inStock ? 'bg-[#25D366]' : 'bg-slate-700 opacity-50'} flex justify-center items-center space-x-2`}>
                                    <span>{viewingProduct.inStock ? 'ORDER ON WHATSAPP' : 'TEMPORARILY SOLD OUT'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filtered.map(p => (
                            <div key={p.id} onClick={() => setViewingProduct(p)} className="group bg-slate-800/40 rounded-[2rem] border border-slate-700/50 p-6 cursor-pointer">
                                <div className="aspect-square bg-white rounded-2xl mb-6 p-4 overflow-hidden relative">
                                    <img src={p.images[0]} className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
                                    {!p.inStock && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-white italic text-xs uppercase tracking-widest">Sold Out</div>}
                                </div>
                                <h4 className="text-lg font-black italic mb-2">{p.name}</h4>
                                <p className="text-2xl font-black text-blue-500">{p.price}</p>
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