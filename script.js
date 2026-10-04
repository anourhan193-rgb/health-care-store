const STORAGE_KEY = "healthCareProducts";

const defaultProducts = {
  health: [
    {
      id: 1,
      name: "كمادات حرارية",
      price: 45,
      icon: "🧊",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
      description: "مريحة للتخفيف من الآلام والالتهابات",
      category: "health"
    },
    {
      id: 2,
      name: "مقياس ضغط",
      price: 180,
      icon: "🩺",
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
      description: "قياس دقيق للضغط المنزلي",
      category: "health"
    },
    {
      id: 3,
      name: "منظف وتعقيم",
      price: 60,
      icon: "🧴",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
      description: "مناسب للعناية الشخصية والمنزلية",
      category: "health"
    },
    {
      id: 4,
      name: "مسكنات",
      price: 35,
      icon: "💊",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      description: "مضادات ألم يومية وسريعة الفعالية",
      category: "health"
    }
  ],
  science: [
    {
      id: 5,
      name: "مجهر صغير",
      price: 220,
      icon: "🔬",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
      description: "للمختبرات التعليمية والبحثية",
      category: "science"
    },
    {
      id: 6,
      name: "قوارير زجاجية",
      price: 80,
      icon: "🧪",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      description: "مناسبة للاختبارات العلمية والعمليات",
      category: "science"
    },
    {
      id: 7,
      name: "أدوات رسم",
      price: 55,
      icon: "📐",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      description: "منشورات ومواد تعليمية للطلاب",
      category: "science"
    },
    {
      id: 8,
      name: "مستلزمات مختبرية",
      price: 120,
      icon: "🧫",
      image: "https://images.unsplash.com/photo-1576613109753-27804de2cba8?auto=format&fit=crop&w=800&q=80",
      description: "أدوات أساسية للاستخدام المختبري",
      category: "science"
    }
  ],
  laboratory: [
    {
      id: 9,
      name: "قمع زجاجي",
      price: 70,
      icon: "🧫",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
      description: "أداة مهمة في المختبرات الطبية",
      category: "laboratory"
    },
    {
      id: 10,
      name: "أنابيب اختبار",
      price: 90,
      icon: "🧪",
      image: "https://images.unsplash.com/photo-1532619187604-ab6e078d1a5d?auto=format&fit=crop&w=800&q=80",
      description: "مجموعة مختبرية متكاملة",
      category: "laboratory"
    },
    {
      id: 11,
      name: "قفازات طبية",
      price: 40,
      icon: "🩸",
      image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80",
      description: "حماية مناسبة للاستخدام الطبي",
      category: "laboratory"
    },
    {
      id: 12,
      name: "مشرط جراحي",
      price: 110,
      icon: "🔪",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
      description: "أداة دقيقة ومعتمدة للاستخدام الطبي",
      category: "laboratory"
    }
  ]
};

const WHATSAPP_NUMBER = "966500000000";

function getStoredProducts() {
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
  } catch (error) {
    console.error("خطأ في قراءة العناصر:", error);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return JSON.parse(JSON.stringify(defaultProducts));
}

let products = getStoredProducts();
let cart = JSON.parse(localStorage.getItem("healthCareCart")) || [];
let activeCategory = "all";
let searchText = "";

function formatCurrency(value) {
  return `${value} جنيه`;
}

function saveCart() {
  localStorage.setItem("healthCareCart", JSON.stringify(cart));
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getAllProducts() {
  return Object.values(products).flat();
}

function findProductById(productId) {
  return getAllProducts().find((product) => product.id === productId) || null;
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + Number(item.quantity), 0);
}

function updateCartBadge() {
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.textContent = getCartCount();
  }
}

function renderProducts() {
  Object.keys(products).forEach((categoryKey) => {
    const container = document.getElementById(`${categoryKey}Products`);
    if (!container) return;

    const categoryProducts = (products[categoryKey] || []).filter((product) => {
      const text = `${product.name} ${product.description}`.toLowerCase();
      const matchesSearch = text.includes(searchText);
      if (activeCategory === "all") return matchesSearch;
      return product.category === activeCategory && matchesSearch;
    });

    if (categoryProducts.length === 0) {
      container.innerHTML = `
        <div class="empty-message" style="grid-column: 1 / -1;">
          لا توجد منتجات مطابقة للبحث الحالي
        </div>
      `;
      return;
    }

    container.innerHTML = categoryProducts.map((product) => `
      <article class="product-card">
        <img class="product-image" src="${product.image}" alt="${product.name}" />
        <div class="product-body">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <span class="price">${formatCurrency(product.price)}</span>
          <button class="add-button" onclick="addToCart(${product.id})">أضف إلى السلة</button>
        </div>
      </article>
    `).join("");
  });
}

function filterProducts(category, button) {
  activeCategory = category;

  document.querySelectorAll(".category-button").forEach((btn) => {
    btn.classList.toggle("active", btn === button);
  });

  document.querySelectorAll(".product-category").forEach((section) => {
    const visible = category === "all" || section.dataset.category === category;
    section.classList.toggle("hidden", !visible);
  });

  renderProducts();
}

function handleSearchInput() {
  const value = document.getElementById("searchInput").value.trim().toLowerCase();
  searchText = value;
  renderProducts();
}

function addToCart(productId) {
  const product = findProductById(productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function updateQuantity(productId, change) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== productId);
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  updateCartBadge();
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");

  if (!cartItemsContainer || !subtotalEl || !deliveryEl || !totalEl) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-message">
        السلة فارغة حاليًا 🛒
      </div>
    `;
    subtotalEl.textContent = "0 جنيه";
    deliveryEl.textContent = "0 جنيه";
    totalEl.textContent = "0 جنيه";
    return;
  }

  let subtotal = 0;

  cartItemsContainer.innerHTML = cart.map((item) => {
    const product = findProductById(item.id);
    if (!product) return "";

    subtotal += product.price * item.quantity;

    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <img class="cart-item-thumb" src="${product.image}" alt="${product.name}" />
          <div class="cart-item-text">
            <h4>${product.name}</h4>
            <p>${formatCurrency(product.price)} لكل قطعة</p>
          </div>
        </div>

        <div class="cart-item-actions">
          <div class="quantity-box">
            <button onclick="updateQuantity(${product.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${product.id}, 1)">+</button>
          </div>
          <button class="remove-button" onclick="removeFromCart(${product.id})">حذف</button>
        </div>
      </div>
    `;
  }).join("");

  const delivery = subtotal > 0 ? 15 : 0;
  const total = subtotal + delivery;

  subtotalEl.textContent = formatCurrency(subtotal);
  deliveryEl.textContent = formatCurrency(delivery);
  totalEl.textContent = formatCurrency(total);
}

function submitOrder() {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const selectedPayment = document.querySelector('input[name="payment"]:checked');

  if (!name || !phone || !address || !selectedPayment) {
    alert("يرجى إدخال الاسم، رقم الهاتف، العنوان، وطريقة الدفع.");
    return;
  }

  if (cart.length === 0) {
    alert("السلة فارغة. أضف منتجات قبل إرسال الطلب.");
    return;
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = findProductById(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const delivery = subtotal > 0 ? 15 : 0;
  const total = subtotal + delivery;

  const cartText = cart.map((item) => {
    const product = findProductById(item.id);
    return `- ${product ? product.name : "منتج"} × ${item.quantity}`;
  }).join("\n");

  const message = `
*طلب جديد من Health Care*

الاسم: ${name}
الهاتف: ${phone}
العنوان: ${address}
طريقة الدفع: ${selectedPayment.value}

المنتجات:
${cartText}

إجمالي المنتجات: ${formatCurrency(subtotal)}
سعر التوصيل: ${formatCurrency(delivery)}
الإجمالي النهائي: ${formatCurrency(total)}
`.trim();

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  document.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", () => filterProducts(button.dataset.category, button));
  });

  const defaultCategoryButton = document.querySelector(".category-button.active");
  if (defaultCategoryButton) {
    filterProducts("all", defaultCategoryButton);
  }

  renderCart();
  updateCartBadge();
});

window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.submitOrder = submitOrder;
window.filterProducts = filterProducts;
window.handleSearchInput = handleSearchInput;
window.saveProducts = saveProducts;
