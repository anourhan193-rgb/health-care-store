```javascript
const CART_KEY = "healthCareCart";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQX6-lkfwu06oaI2wwGSX2QeNqxqv17CjDn0AuCitC1hISZmcohT4wIr4payb54Urrgd135BpX3nspk/pub?gid=0&single=true&output=csv";
// رقم واتساب المتجر المصري
const WHATSAPP_NUMBER = "201208791400";

const categoryKeys = ["health", "science", "laboratory"];

let products = {
  health: [],
  science: [],
  laboratory: []
};

let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
let activeCategory = "all";
let searchText = "";


function formatCurrency(value) {
  return Number(value || 0).toLocaleString("ar-EG") + " جنيه";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeImageURL(value) {
  try {
    const url = new URL(String(value || "").trim());
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function normalize(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه");
}

function mapCategory(value) {
  const category = normalize(value);

  if (
    category.includes("معمل") ||
    category.includes("تحاليل") ||
    category.includes("laboratory") ||
    category === "lab"
  ) {
    return "laboratory";
  }

  if (
    category.includes("كليه") ||
    category.includes("كليات") ||
    category.includes("علميه") ||
    category.includes("علوم") ||
    category.includes("science")
  ) {
    return "science";
  }

  // الرعاية الصحية هي القسم الافتراضي
  return "health";
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;

      row.push(field.trim());

      if (row.some(value => value !== "")) rows.push(row);

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some(value => value !== "")) rows.push(row);

  return rows;
}

function findColumn(headers, names, fallback) {
  const index = headers.findIndex(header =>
    names.includes(normalize(header))
  );

  return index === -1 ? fallback : index;
}

function convertPrice(value) {
  const digits = String(value || "")
    .replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[۰-۹]/g, digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));

  const price = Number(
    digits.replace(/جنيه|ج\.م|EGP/gi, "").replace(/[,\s،]/g, "")
  );

  return Number.isFinite(price) && price >= 0 ? price : 0;
}

function createId(category, name, index) {
  return category + "-" + index + "-" + name;
}

function convertSheetToProducts(csvText) {
  const rows = parseCSV(csvText);

  if (rows.length === 0) {
    throw new Error("جدول Google Sheets فارغ.");
  }

  const headers = rows[0];

  const nameIndex = findColumn(
    headers, ["اسم المنتج", "المنتج", "name", "product name"], 0
  );

  const categoryIndex = findColumn(
    headers, ["القسم", "التصنيف", "category"], 1
  );

  const priceIndex = findColumn(
    headers, ["السعر", "price"], 2
  );

  const imageIndex = findColumn(
    headers, ["رابط الصورة", "الصورة", "image", "image url"], 3
  );

  const result = {
    health: [],
    science: [],
    laboratory: []
  };

  rows.slice(1).forEach((row, index) => {
    const name = row[nameIndex]?.trim();
    if (!name) return;

    const category = mapCategory(row[categoryIndex]);

    result[category].push({
      id: createId(category, name, index),
      name,
      price: convertPrice(row[priceIndex]),
      image: safeImageURL(row[imageIndex]),
      description: "",
      category
    });
  });

  return result;
}

function getAllProducts() {
  return Object.values(products).flat();
}

function findProductById(id) {
  return getAllProducts().find(
    product => String(product.id) === String(id)
  ) || null;
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
  const element = document.getElementById("cartCount");
  if (element) element.textContent = getCartCount();
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function renderProducts() {
  categoryKeys.forEach(category => {
    const container = document.getElementById(category + "Products");
    if (!container) return;

   
container.innerHTML = filtered.map(function(product) {
  const imageHTML = product.image
    ? '<img class="product-image" src="' +
      escapeHTML(product.image) +
      '" alt="' + escapeHTML(product.name) +
      '" loading="lazy" onerror="this.style.display=\'none\'">'
    : '';

  return '<article class="product-card">' +
    imageHTML +
    '<div class="product-body">' +
      '<h3>' + escapeHTML(product.name) + '</h3>' +
      '<p>' + escapeHTML(product.description) + '</p>' +
      '<span class="price">' + formatCurrency(product.price) + '</span>' +
      '<button class="add-button" onclick="addToCart(\'' +
        escapeHTML(product.id) +
        '\')">أضف إلى السلة</button>' +
    '</div>' +
  '</article>';
}).join("");
  });
}

function filterProducts(category, button) {
  activeCategory = category;

  document.querySelectorAll(".category-button").forEach(btn => {
    btn.classList.toggle("active", btn === button);
  });

  document.querySelectorAll(".product-category").forEach(section => {
    section.classList.toggle(
      "hidden",
      category !== "all" && section.dataset.category !== category
    );
  });

  renderProducts();
}

function handleSearchInput() {
  searchText = document.getElementById("searchInput")
    ?.value.trim().toLowerCase() || "";

  renderProducts();
}

function addToCart(productId) {
  const product = findProductById(productId);
  if (!product) return;

  const existing = cart.find(item => String(item.id) === String(productId));

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function updateQuantity(productId, change) {
  const item = cart.find(entry => String(entry.id) === String(productId));
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => String(entry.id) !== String(productId));
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function removeFromCart(productId) {
  cart = cart.filter(item => String(item.id) !== String(productId));
  saveCart();
  renderCart();
  updateCartBadge();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");

  if (!container || !subtotalEl || !deliveryEl || !totalEl) return;

  cart = cart.filter(item => findProductById(item.id));

  if (!cart.length) {
    container.innerHTML = `<div class="empty-message">السلة فارغة حاليًا 🛒</div>`;
    subtotalEl.textContent = formatCurrency(0);
    deliveryEl.textContent = formatCurrency(0);
    totalEl.textContent = formatCurrency(0);
    saveCart();
    return;
  }

  let subtotal = 0;

  container.innerHTML = cart.map(item => {
    const product = findProductById(item.id);
    if (!product) return "";

    subtotal += product.price * item.quantity;

    return `
      <div class="cart-item">
        <div class="cart-item-info">
          ${
            product.image
              ? `<img class="cart-item-thumb"
                      src="${escapeHTML(product.image)}"
                      alt="${escapeHTML(product.name)}">`
              : ""
          }
          <div class="cart-item-text">
            <h4>${escapeHTML(product.name)}</h4>
            <p>${formatCurrency(product.price)} لكل قطعة</p>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-box">
            <button onclick="updateQuantity('${escapeHTML(product.id)}',-1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${escapeHTML(product.id)}',1)">+</button>
          </div>
          <button class="remove-button"
            onclick="removeFromCart('${escapeHTML(product.id)}')">حذف</button>
        </div>
      </div>
    `;
  }).join("");

  const delivery = subtotal > 0 ? 15 : 0;

  subtotalEl.textContent = formatCurrency(subtotal);
  deliveryEl.textContent = formatCurrency(delivery);
  totalEl.textContent = formatCurrency(subtotal + delivery);

  saveCart();
}

function submitOrder() {
  const name = document.getElementById("customerName")?.value.trim();
  const phone = document.getElementById("customerPhone")?.value.trim();
  const address = document.getElementById("customerAddress")?.value.trim();
  const payment = document.querySelector('input[name="payment"]:checked');

  if (!name || !phone || !address || !payment) {
    alert("يرجى إدخال الاسم ورقم الهاتف والعنوان وطريقة الدفع.");
    return;
  }

  if (!cart.length) {
    alert("السلة فارغة. أضيفي منتجات قبل إرسال الطلب.");
    return;
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = findProductById(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const delivery = subtotal > 0 ? 15 : 0;

  const itemsText = cart.map(item => {
    const product = findProductById(item.id);
    return `- ${product ? product.name : "منتج"} × ${item.quantity}`;
  }).join("\n");

  const message = `
*طلب جديد من Health Care*

الاسم: ${name}
الهاتف: ${phone}
العنوان: ${address}
طريقة الدفع: ${payment.value}

المنتجات:
${itemsText}

إجمالي المنتجات: ${formatCurrency(subtotal)}
سعر التوصيل: ${formatCurrency(delivery)}
الإجمالي النهائي: ${formatCurrency(subtotal + delivery)}
`.trim();

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

async function loadProductsFromSheet() {
  try {
    const response = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("تعذر تحميل الشيت.");

    const csv = await response.text();
    const loaded = convertSheetToProducts(csv);

    products = loaded;

    // إزالة السلة القديمة التي تحتوي على منتجات لم تعد موجودة
    cart = cart.filter(item => findProductById(item.id));
    saveCart();

    renderProducts();
    renderCart();
    updateCartBadge();

  } catch (error) {
    console.error(error);
    products = { health: [], science: [], laboratory: [] };
    renderProducts();
    renderCart();
    updateCartBadge();

    alert("تعذر تحميل المنتجات. تأكدي أن Google Sheets منشور على الويب.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  document.querySelectorAll(".category-button").forEach(button => {
    button.addEventListener("click", () => {
      filterProducts(button.dataset.category, button);
    });
  });

  const allButton = document.querySelector(
    '.category-button[data-category="all"]'
  );

  if (allButton) filterProducts("all", allButton);

  loadProductsFromSheet();
});

window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.submitOrder = submitOrder;
window.filterProducts = filterProducts;
window.handleSearchInput = handleSearchInput;
```
