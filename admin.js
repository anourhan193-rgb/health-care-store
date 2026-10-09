const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "healthcare";
const ADMIN_CREDENTIALS_KEY = "adminCredentials";
const STORAGE_KEY = "healthCareProducts";

const defaultProducts = {
  health: [
    { id: 1, name: "كمادات حرارية", price: 45, icon: "🧊", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80", description: "مريحة للتخفيف من الآلام والالتهابات", category: "health" },
    { id: 2, name: "مقياس ضغط", price: 180, icon: "🩺", image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80", description: "قياس دقيق للضغط المنزلي", category: "health" },
    { id: 3, name: "منظف وتعقيم", price: 60, icon: "🧴", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80", description: "مناسب للعناية الشخصية والمنزلية", category: "health" },
    { id: 4, name: "مسكنات", price: 35, icon: "💊", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", description: "مضادات ألم يومية وسريعة الفعالية", category: "health" }
  ],
  science: [
    { id: 5, name: "مجهر صغير", price: 220, icon: "🔬", image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80", description: "للمختبرات التعليمية والبحثية", category: "science" },
    { id: 6, name: "قوارير زجاجية", price: 80, icon: "🧪", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80", description: "مناسبة للاختبارات العلمية والعمليات", category: "science" },
    { id: 7, name: "أدوات رسم", price: 55, icon: "📐", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", description: "منشورات ومواد تعليمية للطلاب", category: "science" },
    { id: 8, name: "مستلزمات مختبرية", price: 120, icon: "🧫", image: "https://images.unsplash.com/photo-1576613109753-27804de2cba8?auto=format&fit=crop&w=800&q=80", description: "أدوات أساسية للاستخدام المختبري", category: "science" }
  ],
  laboratory: [
    { id: 9, name: "قمع زجاجي", price: 70, icon: "🧫", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80", description: "أداة مهمة في المختبرات الطبية", category: "laboratory" },
    { id: 10, name: "أنابيب اختبار", price: 90, icon: "🧪", image: "https://images.unsplash.com/photo-1532619187604-ab6e078d1a5d?auto=format&fit=crop&w=800&q=80", description: "مجموعة مختبرية متكاملة", category: "laboratory" },
    { id: 11, name: "قفازات طبية", price: 40, icon: "🩸", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80", description: "حماية مناسبة للاستخدام الطبي", category: "laboratory" },
    { id: 12, name: "مشرط جراحي", price: 110, icon: "🔪", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80", description: "أداة دقيقة ومعتمدة للاستخدام الطبي", category: "laboratory" }
  ]
};

function initializeAdminCredentials() {
  const saved = localStorage.getItem(ADMIN_CREDENTIALS_KEY);

  if (!saved) {
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify({
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD
    }));
  }
}
  const saved = localStorage.getItem(ADMIN_CREDENTIALS_KEY);

  if (!saved) {
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify({
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD
    }));
  }
}


function getAdminCredentials() {
  return {
    username: "admin",
    password: "healthcare"
  };
}
  const saved = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (!saved) {
    initializeAdminCredentials();
    return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
  }

  try {
    return JSON.parse(saved);
  } catch {
    return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
  }
}

function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    return JSON.parse(JSON.stringify(defaultProducts));
  }

  try {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    console.error("Error reading products");
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return JSON.parse(JSON.stringify(defaultProducts));
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function loginAdmin() {
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const error = document.getElementById("loginError");

  const credentials = getAdminCredentials();

  if (username === credentials.username && password === credentials.password) {
    document.getElementById("loginWrap").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    error.textContent = "";
    renderProductsTable();
    return;
  }

  error.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة";
}

function logoutAdmin() {
  document.getElementById("loginWrap").style.display = "flex";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminUsername").value = "";
  document.getElementById("adminPassword").value = "";
}

function resetAddForm() {
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productCategory").value = "";
  document.getElementById("productIcon").value = "";
  document.getElementById("productDescription").value = "";
  document.getElementById("productImage").value = "";
}

function changePassword() {
  const currentPassword = prompt("أدخل كلمة المرور الحالية:");
  if (!currentPassword) return;

  const credentials = getAdminCredentials();

  if (currentPassword !== credentials.password) {
    alert("كلمة المرور الحالية غير صحيحة");
    return;
  }

  const newPassword = prompt("أدخل كلمة المرور الجديدة:");
  if (!newPassword || newPassword.length < 6) {
    alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    return;
  }

  credentials.password = newPassword;
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials));
  alert("تم تغيير كلمة المرور بنجاح");
}

document.getElementById("addProductForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const price = Number(document.getElementById("productPrice").value);
  const category = document.getElementById("productCategory").value;
  const icon = document.getElementById("productIcon").value.trim();
  const description = document.getElementById("productDescription").value.trim();
  const image = document.getElementById("productImage").value.trim();

  if (!name || !category || !icon || !description || !image || Number.isNaN(price)) {
    showToast("يرجى تعبئة جميع الحقول بشكل صحيح");
    return;
  }

  const products = getProducts();
  if (!products[category]) products[category] = [];

  products[category].push({
    id: Date.now(),
    name,
    price,
    icon,
    image,
    description,
    category
  });

  saveProducts(products);
  renderProductsTable();
  resetAddForm();
  showToast("تمت إضافة المنتج بنجاح");
});

function renderProductsTable() {
  const container = document.getElementById("productsTableContainer");
  if (!container) return;

  const products = getProducts();
  const allProducts = Object.values(products).flat();

  if (!allProducts.length) {
    container.innerHTML = "<div class='empty-state'>لا توجد منتجات الآن</div>";
    return;
  }

  const rows = allProducts.map((product) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price}</td>
      <td>${product.description}</td>
      <td><img src="${product.image}" class="product-thumb" alt="${product.name}" /></td>
      <td>${product.icon}</td>
      <td>
        <div class="mini-actions">
          <button class="btn btn-primary" onclick="openEditModal(${product.id})">تعديل</button>
          <button class="btn btn-danger" onclick="confirmDelete(${product.id})">حذف</button>
        </div>
      </td>
    </tr>
  `).join("");

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>اسم المنتج</th>
          <th>الفئة</th>
          <th>السعر</th>
          <th>الوصف</th>
          <th>الصورة</th>
          <th>الرمز</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function openEditModal(productId) {
  const products = getProducts();
  const allProducts = Object.values(products).flat();
  const product = allProducts.find((item) => item.id === productId);

  if (!product) return;

  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductDescription").value = product.description;
  document.getElementById("editProductIcon").value = product.icon;
  document.getElementById("editProductImage").value = product.image;

  document.getElementById("editModal").classList.add("show");
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
}

document.getElementById("editProductForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = Number(document.getElementById("editProductId").value);
  const name = document.getElementById("editProductName").value.trim();
  const price = Number(document.getElementById("editProductPrice").value);
  const description = document.getElementById("editProductDescription").value.trim();
  const icon = document.getElementById("editProductIcon").value.trim();
  const image = document.getElementById("editProductImage").value.trim();

  if (!name || !description || !icon || !image || Number.isNaN(price)) {
    showToast("يرجى تعبئة جميع الحقول بشكل صحيح");
    return;
  }

  const products = getProducts();
  let updated = false;

  Object.keys(products).forEach((category) => {
    products[category] = products[category].map((product) => {
      if (product.id === id) {
        updated = true;
        return { ...product, name, price, description, icon, image };
      }
      return product;
    });
  });

  if (!updated) {
    showToast("لم يتم العثور على المنتج المراد تعديله");
    return;
  }

  saveProducts(products);
  renderProductsTable();
  closeEditModal();
  showToast("تم تعديل المنتج بنجاح");
});

function confirmDelete(productId) {
  const confirmed = confirm("هل أنت متأكد من حذف هذا المنتج؟");
  if (!confirmed) return;

  const products = getProducts();

  Object.keys(products).forEach((category) => {
    products[category] = products[category].filter((product) => product.id !== productId);
  });

  saveProducts(products);
  renderProductsTable();
  showToast("تم حذف المنتج بنجاح");
}

function exportProducts() {
  const data = JSON.stringify(getProducts(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "health-care-products.json";
  a.click();
  URL.revokeObjectURL(url);

  showToast("تم تصدير البيانات بنجاح");
}

function importProducts(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("تنسيق غير صحيح");
      }

      saveProducts(parsed);
      renderProductsTable();
      showToast("تم استيراد البيانات بنجاح");
    } catch (err) {
      showToast("ملف الاستيراد غير صالح");
    }
  };

  reader.readAsText(file);
  event.target.value = "";
}

function resetToDefaultProducts() {
  const confirmed = confirm("هل تريد إعادة تعيين المنتجات إلى القيم الافتراضية؟");
  if (!confirmed) return;

  saveProducts(defaultProducts);
  renderProductsTable();
  showToast("تمت إعادة تعيين المنتجات بنجاح");
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });

    document.querySelectorAll(".panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `${tab}Panel`);
    });
  });
});

initializeAdminCredentials();

window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.changePassword = changePassword;
window.resetAddForm = resetAddForm;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.confirmDelete = confirmDelete;
window.exportProducts = exportProducts;
window.importProducts = importProducts;
window.resetToDefaultProducts = resetToDefaultProducts;
