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
async function loadInventory() {
    const list = document.getElementById('inventoryList');
    const totalCountLabel = document.getElementById('totalCount');
    list.innerHTML = `<div class="p-10 text-center animate-pulse text-blue-500 font-black uppercase">Refreshing...</div>`;
    
    try {
        // Adding unique timestamp forces the browser to fetch the absolute latest version from GitHub
        const res = await fetch(`data/products.json?v=${Date.now()}`);
        const products = await res.json();
        
        // Update the "Total Items" count in the Store Overview
        if (totalCountLabel) totalCountLabel.innerText = products.length;

        list.innerHTML = products.map(p => `
            <div class="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-blue-500 transition-all">
                <div class="flex items-center space-x-4">
                    <img src="${p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/150?text=No+Image'}" 
                         class="w-12 h-12 object-contain bg-white rounded-lg shadow-inner">
                    <div class="overflow-hidden">
                        <p class="text-[10px] font-black italic uppercase truncate w-32 text-white">${p.name}</p>
                        <p class="text-[9px] ${p.inStock ? 'text-green-500' : 'text-red-500'} font-black tracking-tighter">
                            ${p.inStock ? '● ONLINE' : '○ OUT OF STOCK'}
                        </p>
                    </div>
                </div>
                <div class="flex space-x-1">
                    <button onclick="editProduct(${p.id})" class="text-blue-400 p-2 hover:bg-blue-500/20 rounded-xl transition"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="text-red-500 p-2 hover:bg-red-500/20 rounded-xl transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).reverse().join('');
        lucide.createIcons();
    } catch (e) { 
        list.innerHTML = `<div class="p-10 text-center text-slate-600 uppercase font-black">No Data Found</div>`; 
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