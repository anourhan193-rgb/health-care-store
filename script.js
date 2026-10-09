
const CART_KEY = "healthCareCart";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQX6-lkfwu06oaI2wwGSX2QeNqxqv17CjDn0AuCitC1hISZmcohT4wIr4payb54Urrgd135BpX3nspk/pub?gid=0&single=true&output=csv";

const WHATSAPP_NUMBER = "201208791400";

const categoryKeys = ["health", "science", "laboratory"];

let products = {
  health: [],
  science: [],
  laboratory: []
};

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch (error) {
  cart = [];
}

let activeCategory = "all";
let searchText = "";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("ar-EG") + " جنيه";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function(char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function safeImageURL(value) {
  try {
    const url = new URL(String(value || "").trim());

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch (error) {
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
    } else if (
      (char === "\n" || char === "\r") &&
      !quoted
    ) {
      if (char === "\r" && next === "\n") {
        i++;
      }

      row.push(field.trim());

      if (row.some(function(value) {
        return value !== "";
      })) {
        rows.push(row);
      }

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field.trim());

  if (row.some(function(value) {
    return value !== "";
  })) {
    rows.push(row);
  }

  return rows;
}

function findColumn(headers, names, fallback) {
  const normalizedNames = names.map(function(name) {
    return normalize(name);
  });

  const index = headers.findIndex(function(header) {
    return normalizedNames.includes(normalize(header));
  });

  return index === -1 ? fallback : index;
}

function convertPrice(value) {
  const digits = String(value || "")
    .replace(/[٠-٩]/g, function(digit) {
      return "٠١٢٣٤٥٦٧٨٩".indexOf(digit);
    })
    .replace(/[۰-۹]/g, function(digit) {
      return "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
    });

  const price = Number(
    digits
      .replace(/جنيه|ج\.م|EGP/gi, "")
      .replace(/[,\s،]/g, "")
  );

  return Number.isFinite(price) && price >= 0
    ? price
    : 0;
}

function createId(category, name, index) {
  return category + "-" + index + "-" + name;
}

function convertSheetToProducts(csvText) {
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error("جدول Google Sheets لا يحتوي على منتجات.");
  }

  const headers = rows[0];

  const nameIndex = findColumn(
    headers,
    ["اسم المنتج", "المنتج", "name", "product name"],
    0
  );

  const categoryIndex = findColumn(
    headers,
    ["القسم", "التصنيف", "category"],
    1
  );

  const priceIndex = findColumn(
    headers,
    ["السعر", "price"],
    2
  );

  const imageIndex = findColumn(
    headers,
    ["رابط الصورة", "الصورة", "image", "image url"],
    3
  );

  const descriptionIndex = findColumn(
    headers,
    ["الوصف", "وصف المنتج", "description"],
    -1
  );

  const result = {
    health: [],
    science: [],
    laboratory: []
  };

  rows.slice(1).forEach(function(row, index) {
    const name = String(row[nameIndex] || "").trim();

    if (!name) return;

    const category = mapCategory(row[categoryIndex]);

    result[category].push({
      id: createId(category, name, index),
      name: name,
      price: convertPrice(row[priceIndex]),
      image: safeImageURL(row[imageIndex]),
      description: descriptionIndex >= 0
        ? String(row[descriptionIndex] || "").trim()
        : "",
      category: category
    });
  });

  return result;
}

function getAllProducts() {
  return categoryKeys.reduce(function(all, category) {
    return all.concat(products[category] || []);
  }, []);
}

function findProductById(id) {
  return getAllProducts().find(function(product) {
    return String(product.id) === String(id);
  }) || null;
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("تعذر حفظ سلة المشتريات:", error);
  }
}

function getCartCount() {
  return cart.reduce(function(sum, item) {
    return sum + Number(item.quantity || 0);
  }, 0);
}

function updateCartBadge() {
  const element = document.getElementById("cartCount");

  if (element) {
    element.textContent = getCartCount();
  }
}

function renderProducts() {
  categoryKeys.forEach(function(category) {
    const container = document.getElementById(
      category + "Products"
    );

    if (!container) return;

    const list = products[category] || [];

    const filtered = list.filter(function(product) {
      const name = normalize(product.name);
      const description = normalize(product.description);
      const search = normalize(searchText);

      const matches =
        name.includes(search) ||
        description.includes(search);

      const categoryMatches =
        activeCategory === "all" ||
        product.category === activeCategory;

      return matches && categoryMatches;
    });

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="empty-message" style="grid-column:1/-1">' +
        "لا توجد منتجات في هذا القسم حاليًا" +
        "</div>";

      return;
    }

    let html = "";

    filtered.forEach(function(product) {
      let imageHTML = "";

      if (product.image) {
        imageHTML =
          '<img class="product-image" src="' +
          escapeHTML(product.image) +
          '" alt="' +
          escapeHTML(product.name) +
          '" loading="lazy">';
      }

      html +=
        '<article class="product-card">' +
          imageHTML +
          '<div class="product-body">' +
            '<h3>' + escapeHTML(product.name) + '</h3>' +
            '<p>' + escapeHTML(product.description || "") + '</p>' +
            '<span class="price">' +
              formatCurrency(product.price) +
            '</span>' +
            '<button class="add-button" data-product-id="' +
              escapeHTML(product.id) +
              '" type="button">' +
              "أضف إلى السلة" +
            "</button>" +
          "</div>" +
        "</article>";
    });

    container.innerHTML = html;

    container.querySelectorAll(".add-button").forEach(
      function(button) {
        button.addEventListener("click", function() {
          addToCart(button.getAttribute("data-product-id"));
        });
      }
    );
  });
}

function filterProducts(category, button) {
  activeCategory = category || "all";

  document.querySelectorAll(".category-button").forEach(
    function(btn) {
      btn.classList.toggle("active", btn === button);
    }
  );

  document.querySelectorAll(".product-category").forEach(
    function(section) {
      const shouldHide =
        activeCategory !== "all" &&
        section.dataset.category !== activeCategory;

      section.classList.toggle("hidden", shouldHide);
    }
  );

  renderProducts();
}

function handleSearchInput() {
  const searchInput = document.getElementById("searchInput");

  searchText = searchInput
    ? searchInput.value.trim()
    : "";

  renderProducts();
}

function addToCart(productId) {
  const product = findProductById(productId);

  if (!product) return;

  const existing = cart.find(function(item) {
    return String(item.id) === String(productId);
  });

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function updateQuantity(productId, change) {
  const item = cart.find(function(entry) {
    return String(entry.id) === String(productId);
  });

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(function(entry) {
      return String(entry.id) !== String(productId);
    });
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function removeFromCart(productId) {
  cart = cart.filter(function(item) {
    return String(item.id) !== String(productId);
  });

  saveCart();
  renderCart();
  updateCartBadge();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");

  if (!container || !subtotalEl || !deliveryEl || !totalEl) {
    return;
  }

  cart = cart.filter(function(item) {
    return findProductById(item.id);
  });

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="empty-message">السلة فارغة حاليًا 🛒</div>';

    subtotalEl.textContent = formatCurrency(0);
    deliveryEl.textContent = formatCurrency(0);
    totalEl.textContent = formatCurrency(0);

    saveCart();
    updateCartBadge();
    return;
  }

  let subtotal = 0;
  let html = "";

  cart.forEach(function(item) {
    const product = findProductById(item.id);

    if (!product) return;

    const price = Number(product.price) || 0;
    const quantity = Number(item.quantity) || 1;

    subtotal += price * quantity;

    let imageHTML = "";

    if (product.image) {
      imageHTML =
        '<img class="cart-item-thumb" src="' +
        escapeHTML(product.image) +
        '" alt="' +
        escapeHTML(product.name) +
        '">';
    }

    html +=
      '<div class="cart-item">' +
        '<div class="cart-item-info">' +
          imageHTML +
          '<div class="cart-item-text">' +
            '<h4>' + escapeHTML(product.name) + '</h4>' +
            '<p>' + formatCurrency(price) + " لكل قطعة</p>" +
          '</div>' +
        '</div>' +
        '<div class="cart-item-actions">' +
          '<div class="quantity-box">' +
            '<button type="button" data-action="decrease" data-id="' +
              escapeHTML(product.id) + '">-</button>' +
            '<span>' + quantity + '</span>' +
            '<button type="button" data-action="increase" data-id="' +
              escapeHTML(product.id) + '">+</button>' +
          '</div>' +
          '<button type="button" class="remove-button" ' +
            'data-action="remove" data-id="' +
            escapeHTML(product.id) + '">' +
            "حذف" +
          "</button>" +
        "</div>" +
      "</div>";
  });

  container.innerHTML = html;

  container.querySelectorAll("[data-action]").forEach(
    function(button) {
      button.addEventListener("click", function() {
        const id = button.getAttribute("data-id");
        const action = button.getAttribute("data-action");

        if (action === "increase") {
          updateQuantity(id, 1);
        }

        if (action === "decrease") {
          updateQuantity(id, -1);
        }

        if (action === "remove") {
          removeFromCart(id);
        }
      });
    }
  );

  const delivery = subtotal > 0 ? 15 : 0;

  subtotalEl.textContent = formatCurrency(subtotal);
  deliveryEl.textContent = formatCurrency(delivery);
  totalEl.textContent = formatCurrency(subtotal + delivery);

  saveCart();
  updateCartBadge();
}

function submitOrder() {
  let name = document.getElementById("customerName");
  let phone = document.getElementById("customerPhone");
  let address = document.getElementById("customerAddress");

  const payment = document.querySelector(
    'input[name="payment"]:checked'
  );

  name = name ? name.value.trim() : "";
  phone = phone ? phone.value.trim() : "";
  address = address ? address.value.trim() : "";

  if (!name || !phone || !address || !payment) {
    alert("يرجى إدخال الاسم ورقم الهاتف والعنوان وطريقة الدفع.");
    return;
  }

  if (!cart.length) {
    alert("السلة فارغة. أضيفي منتجات قبل إرسال الطلب.");
    return;
  }

  let subtotal = 0;
  let itemsText = "";

  cart.forEach(function(item) {
    const product = findProductById(item.id);

    if (!product) return;

    const price = Number(product.price) || 0;
    const quantity = Number(item.quantity) || 1;

    subtotal += price * quantity;

    itemsText +=
      "- " + product.name + " × " + quantity + "\n";
  });

  if (!itemsText) {
    alert("لا توجد منتجات صالحة في السلة.");
    return;
  }

  const delivery = subtotal > 0 ? 15 : 0;

  const message =
    "*طلب جديد من Health Care*\n\n" +
    "الاسم: " + name + "\n" +
    "الهاتف: " + phone + "\n" +
    "العنوان: " + address + "\n" +
    "طريقة الدفع: " + payment.value + "\n\n" +
    "المنتجات:\n" + itemsText + "\n" +
    "إجمالي المنتجات: " + formatCurrency(subtotal) + "\n" +
    "سعر التوصيل: " + formatCurrency(delivery) + "\n" +
    "الإجمالي النهائي: " + formatCurrency(subtotal + delivery);

  const whatsappURL =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  window.open(whatsappURL, "_blank");
}

async function loadProductsFromSheet() {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("تعذر تحميل Google Sheets.");
    }

    const csv = await response.text();
    const loaded = convertSheetToProducts(csv);

    products = loaded;

    cart = cart.filter(function(item) {
      return findProductById(item.id);
    });

    saveCart();
    renderProducts();
    renderCart();
    updateCartBadge();

  } catch (error) {
    console.error("خطأ تحميل المنتجات:", error);

    alert(
      "تعذر تحميل المنتجات من Google Sheets. " +
      "راجعي رابط الشيت وطريقة نشره."
    );
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  document.querySelectorAll(".category-button").forEach(function (button) {
    button.addEventListener("click", function () {
      filterProducts(button.dataset.category, button);
    });
  });

  const allButton = document.querySelector(
    '.category-button[data-category="all"]'
  );

  if (allButton) {
    filterProducts("all", allButton);
  }

  loadProductsFromSheet();
});

window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.submitOrder = submitOrder;
window.filterProducts = filterProducts;
window.handleSearchInput = handleSearchInput;

