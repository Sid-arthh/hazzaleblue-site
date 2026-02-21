// CONFIGURATION
const CLOUD_NAME = "dcdh5wh8m"; 
const UPLOAD_PRESET = "HAZZALEBLUE";
const REPO_OWNER = "Sid-arthh";
const REPO_NAME = "hazzaleblue-site";
const FILE_PATH = "data/products.json";

// Helper: Get token from session memory
const getToken = () => sessionStorage.getItem('admin_token');

window.onload = () => {
    if (getToken()) {
        document.getElementById('loginOverlay').classList.add('hidden');
        loadInventory();
    }
    lucide.createIcons();
};

// LOGIN LOGIC
window.attemptLogin = async () => {
    const key = document.getElementById('adminKey').value;
    const btn = document.getElementById('loginBtn');
    if (!key) return;
    
    btn.disabled = true; 
    btn.innerText = "VERIFYING...";

    try {
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { "Authorization": `token ${key}` }
        });
        if (res.ok) {
            sessionStorage.setItem('admin_token', key);
            document.getElementById('loginOverlay').classList.add('hidden');
            loadInventory();
        } else { throw new Error(); }
    } catch (e) {
        document.getElementById('loginError').classList.remove('hidden');
    } finally {
        btn.disabled = false; 
        btn.innerText = "Unlock Dashboard";
    }
};

// GITHUB UPDATE HANDLER
async function updateGitHub(newContent, message, token) {
    const getRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { "Authorization": `token ${token}` }
    });
    const fileData = await getRes.json();
    return fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: { "Authorization": `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            message: message,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(newContent, null, 2)))),
            sha: fileData.sha
        })
    });
}

// LOAD INVENTORY WITH CACHE BUSTING
// Replace your loadInventory in js/admin.js
async function loadInventory() {
    const list = document.getElementById('inventoryList');
    const totalCountLabel = document.getElementById('totalCount');
    list.innerHTML = `<div class="p-10 text-center animate-pulse text-blue-500 font-black uppercase">SYNCING DATABASE...</div>`;
    
    try {
        // Use a high-resolution timestamp to bypass GitHub's cache
        const res = await fetch(`data/products.json?v=${new Date().getTime()}`);
        const products = await res.json();
        
        if (totalCountLabel) totalCountLabel.innerText = products.length;

        list.innerHTML = products.map(p => `
            <div class="bg-slate-900 p-5 rounded-[1.5rem] border border-slate-700 hover:border-blue-500 transition-all shadow-lg">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex gap-4">
                        <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                            <img src="${p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/150?text=Wait'}" 
                                 class="w-full h-full object-contain">
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest">${p.category}</p>
                            <h4 class="text-sm font-black italic uppercase text-white leading-tight mb-1">${p.name}</h4>
                            <p class="text-lg font-black text-white">${p.price}</p>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button onclick="editProduct(${p.id})" class="bg-slate-800 p-2 rounded-lg text-blue-400 hover:bg-blue-500 hover:text-white transition"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                        <button onclick="deleteProduct(${p.id})" class="bg-slate-800 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span class="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">ID: ${p.id}</span>
                    <span class="text-[9px] ${p.inStock ? 'text-green-500' : 'text-red-500'} font-black italic uppercase">${p.inStock ? '● Active' : '○ Sold Out'}</span>
                </div>
            </div>
        `).reverse().join('');
        lucide.createIcons();
    } catch (e) { 
        list.innerHTML = `<div class="p-10 text-center text-slate-600 font-black uppercase">Data Pending Sync...</div>`; 
    }
}

// EDIT HANDLER
window.editProduct = async (id) => {
    const res = await fetch('data/products.json?v=' + Date.now());
    const products = await res.json();
    const p = products.find(item => item.id === id);
    document.getElementById('editId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pCat').value = p.category;
    document.getElementById('pStock').value = p.inStock.toString();
    document.getElementById('pDetails').value = p.details;
    document.getElementById('formTitle').innerText = "Update Product";
    document.getElementById('editBadge').classList.remove('hidden');
    document.getElementById('cancelEdit').classList.remove('hidden');
    window.scrollTo(0,0);
};

// DELETE HANDLER
window.deleteProduct = async (id) => {
    const token = getToken();
    if (!token || !confirm("Delete item permanently?")) return;
    const res = await fetch('data/products.json?v=' + Date.now());
    const products = await res.json();
    const updated = products.filter(p => p.id !== id);
    if ((await updateGitHub(updated, "Deleted Item", token)).ok) { loadInventory(); }
};

// FORM SUBMISSION WITH STATUS UPDATES
document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();
    const btn = document.getElementById('submitBtn');
    const editId = document.getElementById('editId').value;
    
    // VISUAL FEEDBACK
    btn.disabled = true; 
    btn.innerHTML = `<span class="animate-pulse">📤 UPLOADING IMAGES...</span>`;

    try {
        const res = await fetch('data/products.json?v=' + Date.now());
        const products = await res.json();
        let imageUrls = [];
        const files = document.getElementById('pFiles').files;

        // CLOUDINARY UPLOAD
        if (files.length > 0) {
            for (let file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                // Ensure compression happens at upload
                formData.append('transformation', 'w_1000,c_limit,q_auto:good,f_auto');
                
                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { 
                    method: 'POST', 
                    body: formData 
                });
                const cloudData = await cloudRes.json();
                if (cloudData.secure_url) imageUrls.push(cloudData.secure_url);
            }
        }

        const productData = {
            id: editId ? parseInt(editId) : Date.now(),
            name: document.getElementById('pName').value,
            price: document.getElementById('pPrice').value,
            category: document.getElementById('pCat').value,
            inStock: document.getElementById('pStock').value === "true",
            details: document.getElementById('pDetails').value,
            images: imageUrls.length > 0 ? imageUrls : (products.find(p => p.id == editId)?.images || [])
        };

        btn.innerHTML = `<span class="animate-pulse">💾 SAVING TO DATABASE...</span>`;
        
        const updatedList = editId ? products.map(p => p.id == editId ? productData : p) : [...products, productData];
        
        const ghRes = await updateGitHub(updatedList, "Update Item", token);
        
        if (ghRes.ok) {
            btn.classList.replace('bg-blue-600', 'bg-green-600');
            btn.innerText = "✅ SUCCESS! REFRESHING...";
            setTimeout(() => location.reload(), 1500);
        } else {
            throw new Error("GitHub Save Failed");
        }
    } catch (err) { 
        alert("Error: " + err.message);
        btn.disabled = false;
        btn.innerText = "SUBMIT CHANGES";
    }
});

// LOGOUT
window.logout = () => { sessionStorage.removeItem('admin_token'); location.reload(); };
document.getElementById('refreshBtn').addEventListener('click', loadInventory);