// 1. DATABASE CONFIGURATION
const SUPABASE_URL = 'https://fpgamsphgwyramtopbdl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_t5Dro1BgG8sMUpQyMWiE0Q_BxjDTBrn';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const CLOUD_NAME = "dcdh5wh8m"; 
const UPLOAD_PRESET = "HAZZALEBLUE";

const getAdminAuth = () => sessionStorage.getItem('admin_active');

window.onload = () => {
    if (getAdminAuth()) {
        document.getElementById('loginOverlay').classList.add('hidden');
        loadInventory();
    }
    if (window.lucide) lucide.createIcons();
};

window.attemptLogin = () => {
    const key = document.getElementById('adminKey').value;
    if (key === "HazzaleAdmin2026") {
        sessionStorage.setItem('admin_active', 'true');
        document.getElementById('loginOverlay').classList.add('hidden');
        loadInventory();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
};

async function loadInventory() {
    const list = document.getElementById('inventoryList');
    list.innerHTML = `<div class="p-10 text-center animate-pulse text-blue-500 font-black uppercase tracking-widest text-[10px]">Connecting to Live DB...</div>`;
    
    try {
        const { data: products, error } = await supabaseClient.from('products').select('*').order('id', { ascending: false });
        if (error) throw error;

        list.innerHTML = products.map(p => {
            const displayImg = (p.images && p.images[0]) ? p.images[0] : 'https://via.placeholder.com/150?text=No+Image';
            return `
                <div class="bg-slate-900 p-5 rounded-[1.5rem] border border-slate-700 hover:border-blue-500 transition-all shadow-lg">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex gap-4">
                            <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-800">
                                <img src="${displayImg}" class="w-full h-full object-contain">
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest">${p.category}</p>
                                <h4 class="text-sm font-black italic uppercase text-white leading-tight mb-1 truncate w-40">${p.name}</h4>
                                <p class="text-lg font-black text-white">${p.price}</p>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <button onclick="editProduct(${p.id})" class="bg-slate-800 p-2 rounded-lg text-blue-400 hover:bg-blue-500 hover:text-white transition"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                            <button onclick="deleteProduct(${p.id})" class="bg-slate-800 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                </div>`;
        }).join('');
        lucide.createIcons();
    } catch (e) { list.innerHTML = `<div class="p-10 text-center text-red-500 font-black uppercase italic">DB Error</div>`; }
}

document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const editId = document.getElementById('editId').value;
    btn.disabled = true; 
    btn.innerHTML = `<span class="animate-pulse italic">PROCESSING...</span>`;

    try {
        let imageUrls = [];
        const files = document.getElementById('pFiles').files;

        if (files.length > 0) {
            btn.innerHTML = `<span class="animate-pulse italic">UPLOADING ${files.length} IMAGES...</span>`;
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
                const cloudData = await cloudRes.json();
                return cloudData.secure_url;
            });
            imageUrls = await Promise.all(uploadPromises); // Ensures all images save
        }

        let finalImages = imageUrls;
        if (editId && imageUrls.length === 0) {
            const { data: existing } = await supabaseClient.from('products').select('images').eq('id', editId).single();
            finalImages = existing ? existing.images : [];
        }

        const productData = {
            name: document.getElementById('pName').value,
            price: document.getElementById('pName').value.includes('₹') ? document.getElementById('pPrice').value : `₹${document.getElementById('pPrice').value}`,
            category: document.getElementById('pCat').value,
            in_stock: document.getElementById('pStock').value === "true",
            details: document.getElementById('pDetails').value,
            images: finalImages
        };

        let dbResponse;
        if (editId) {
            dbResponse = await supabaseClient.from('products').update(productData).eq('id', editId);
        } else {
            dbResponse = await supabaseClient.from('products').insert([productData]);
        }

        if (!dbResponse.error) {
            btn.classList.replace('bg-blue-600', 'bg-green-600');
            btn.innerText = "✅ SYNCED";
            setTimeout(() => location.reload(), 1000);
        } else { throw dbResponse.error; }
    } catch (err) { alert("Error: " + err.message); btn.disabled = false; btn.innerText = "RETRY"; }
});

window.editProduct = async (id) => {
    const { data: p, error } = await supabaseClient.from('products').select('*').eq('id', id).single();
    if (error || !p) return;
    document.getElementById('editId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price.replace('₹', '');
    document.getElementById('pCat').value = p.category;
    document.getElementById('pStock').value = p.in_stock.toString();
    document.getElementById('pDetails').value = p.details;
    document.getElementById('formTitle').innerText = "Update Item";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = async (id) => {
    if (!confirm("Delete permanently?")) return;
    await supabaseClient.from('products').delete().eq('id', id);
    loadInventory();
};

window.logout = () => { sessionStorage.removeItem('admin_active'); location.reload(); };