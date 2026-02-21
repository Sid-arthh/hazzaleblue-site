const CLOUD_NAME = "dcdh5wh8m"; 
const UPLOAD_PRESET = "HAZZALEBLUE";
const REPO_OWNER = "Sid-arthh";
const REPO_NAME = "hazzaleblue-site";
const FILE_PATH = "data/products.json";

const getToken = () => sessionStorage.getItem('admin_token');

window.onload = () => {
    if (getToken()) {
        document.getElementById('loginOverlay').classList.add('hidden');
        loadInventory();
    }
    lucide.createIcons();
};

window.attemptLogin = async () => {
    const key = document.getElementById('adminKey').value;
    const btn = document.getElementById('loginBtn');
    if (!key) return;
    btn.disabled = true; btn.innerText = "VERIFYING...";

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
        btn.disabled = false; btn.innerText = "Unlock Dashboard";
    }
};

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

async function loadInventory() {
    const list = document.getElementById('inventoryList');
    list.innerHTML = `<div class="p-10 text-center animate-pulse text-blue-500">Loading Inventory...</div>`;
    try {
        const res = await fetch(`data/products.json?v=${Date.now()}`);
        const products = await res.json();
        list.innerHTML = products.map(p => `
            <div class="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <img src="${p.images[0]}" class="w-12 h-12 object-contain bg-white rounded-lg">
                    <div>
                        <p class="text-xs font-black italic uppercase">${p.name}</p>
                        <p class="text-[10px] ${p.inStock ? 'text-green-500' : 'text-red-500'} font-bold">${p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editProduct(${p.id})" class="text-blue-400 p-2"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="text-red-500 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).reverse().join('');
        lucide.createIcons();
    } catch (e) { list.innerHTML = "Error loading inventory."; }
}

window.editProduct = async (id) => {
    const res = await fetch('data/products.json');
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

window.deleteProduct = async (id) => {
    const token = getToken();
    if (!token || !confirm("Delete item?")) return;
    const res = await fetch('data/products.json');
    const products = await res.json();
    const updated = products.filter(p => p.id !== id);
    if ((await updateGitHub(updated, "Deleted Item", token)).ok) { loadInventory(); }
};

document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();
    const btn = document.getElementById('submitBtn');
    const editId = document.getElementById('editId').value;
    btn.disabled = true; btn.innerText = "SAVING...";

    try {
        const res = await fetch('data/products.json');
        const products = await res.json();
        let imageUrls = [];
        const files = document.getElementById('pFiles').files;

        if (files.length > 0) {
            for (let file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                formData.append('transformation', 'w_1000,c_limit,q_auto:good,f_auto');
                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
                const cloudData = await cloudRes.json();
                imageUrls.push(cloudData.secure_url);
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

        const updatedList = editId ? products.map(p => p.id == editId ? productData : p) : [...products, productData];
        if ((await updateGitHub(updatedList, "Update Item", token)).ok) {
            alert("Success!"); location.reload();
        }
    } catch (err) { alert("Error: " + err.message); }
});

window.logout = () => { sessionStorage.removeItem('admin_token'); location.reload(); };
document.getElementById('refreshBtn').addEventListener('click', loadInventory);