// ===============================
// CONFIGURATION YORUSHOP
// Modifie ces valeurs avec tes vrais liens.
// ===============================

const CONFIG = {
  instagram: "https://www.instagram.com/itoshi_yanis/",
  whatsapp: "https://wa.me/33618012150",
  email: "zenasniyanis516@gmail.com"
};

// ===============================
// PRODUITS
// Ajoute ou supprime un maillot en modifiant cette liste.
// stock: true  -> disponible
// stock: false -> rupture de stock
// image: chemin vers la photo (dans images/products/). Laisse vide "" pour
// afficher un visuel de remplacement automatique.
// ===============================

const products = [
  {
    name: "FC Barcelona",
    type: "Maillot domicile",
    season: "2025/26",
    size: "M",
    price: 15,
    stock: true,
    image: "Fc-barcelone.jpg"
  },
  {
    name: "Real Madrid",
    type: "Maillot domicile",
    season: "2025/26",
    size: "L",
    price: 15,
    stock: true,
    image: "Real.webp"
  },
  {
    name: "Paris Saint-Germain",
    type: "Maillot extérieur",
    season: "2024/25",
    size: "S",
    price: 15,
    stock: false,
    image: "Psg.webp"
  },
  {
    name: "Manchester City",
    type: "Maillot domicile",
    season: "2025/26",
    size: "M",
    price: 15,
    stock: true,
    image: "City.webp"
  },
  {
    name: "Bayern Munich",
    type: "Maillot domicile",
    season: "2025/26",
    size: "XL",
    price: 15,
    stock: true,
    image: "Bayern.webp"
  },
  {
    name: "Juventus",
    type: "Maillot extérieur",
    season: "2024/25",
    size: "M",
    price: 15,
    stock: false,
    image: "Juve.webp"
  }
];

// ===============================
// ÉTAT DES FILTRES
// ===============================

let currentAvailability = "all";  // all | available | out
let currentTeam = "all";
let currentSize = "all";
let currentPriceSort = "default"; // default | asc | desc
let currentSearch = "";

// ===============================
// UTILITAIRES
// ===============================

function placeholderSVG(name) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#EFE6D2"/>
      <circle cx="200" cy="120" r="70" fill="#C62828" opacity="0.12"/>
      <text x="200" y="170" font-family="Georgia, serif" font-size="64" fill="#1A2238"
        text-anchor="middle" opacity="0.55">${initials}</text>
    </svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ===============================
// GÉNÉRATION DES OPTIONS DE FILTRE (équipe / taille)
// ===============================

function populateFilterOptions() {
  const teamSelect = document.getElementById("team-filter");
  const sizeSelect = document.getElementById("size-filter");

  const teams = [...new Set(products.map((p) => p.name))].sort();
  const sizes = [...new Set(products.map((p) => p.size))].sort();

  teams.forEach((team) => {
    const opt = document.createElement("option");
    opt.value = team;
    opt.textContent = team;
    teamSelect.appendChild(opt);
  });

  sizes.forEach((size) => {
    const opt = document.createElement("option");
    opt.value = size;
    opt.textContent = size;
    sizeSelect.appendChild(opt);
  });
}

// ===============================
// RENDU DES PRODUITS
// ===============================

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const emptyMsg = document.getElementById("products-empty");

  let list = products.filter((p) => {
    if (currentAvailability === "available" && !p.stock) return false;
    if (currentAvailability === "out" && p.stock) return false;
    if (currentTeam !== "all" && p.name !== currentTeam) return false;
    if (currentSize !== "all" && p.size !== currentSize) return false;
    if (currentSearch) {
      const haystack = (p.name + " " + p.type + " " + p.season).toLowerCase();
      if (!haystack.includes(currentSearch.toLowerCase())) return false;
    }
    return true;
  });

  if (currentPriceSort === "asc") list = [...list].sort((a, b) => a.price - b.price);
  if (currentPriceSort === "desc") list = [...list].sort((a, b) => b.price - a.price);

  grid.innerHTML = "";

  if (list.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imgSrc = product.image && product.image.trim() !== ""
      ? product.image
      : placeholderSVG(product.name);

    card.innerHTML = `
      <div class="product-image">
        <img src="${escapeHtml(imgSrc)}" alt="Maillot ${escapeHtml(product.name)} - ${escapeHtml(product.type)}"
          onerror="this.onerror=null;this.src='${placeholderSVG(product.name)}';">
      </div>
      <div class="product-body">
        <p class="product-team">${escapeHtml(product.name)}</p>
        <p class="product-type">${escapeHtml(product.type)}</p>
        <p class="product-meta">${product.season ? "Saison " + escapeHtml(product.season) + " — " : ""}Taille : ${escapeHtml(product.size)}</p>
        <p class="product-status ${product.stock ? "in-stock" : "out-stock"}">
          ${product.stock ? "Disponible" : "Rupture de stock"}
        </p>
        <div class="product-footer">
          <span class="product-price">${product.price}&nbsp;€</span>
          <button class="btn btn-primary btn-small order-btn" ${product.stock ? "" : "disabled"}
            data-name="${escapeHtml(product.name)}" data-type="${escapeHtml(product.type)}" data-size="${escapeHtml(product.size)}">
            ${product.stock ? "Commander" : "Indisponible"}
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  document.querySelectorAll(".order-btn").forEach((btn) => {
    btn.addEventListener("click", () => openOrderModal(btn.dataset.name, btn.dataset.type, btn.dataset.size));
  });
}

// ===============================
// FILTRES & RECHERCHE
// ===============================

function initFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentAvailability = btn.dataset.filter;
      renderProducts();
    });
  });

  document.getElementById("team-filter").addEventListener("change", (e) => {
    currentTeam = e.target.value;
    renderProducts();
  });

  document.getElementById("size-filter").addEventListener("change", (e) => {
    currentSize = e.target.value;
    renderProducts();
  });

  document.getElementById("price-filter").addEventListener("change", (e) => {
    currentPriceSort = e.target.value;
    renderProducts();
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    renderProducts();
  });
}

// ===============================
// COMMANDE (modale)
// ===============================

function openOrderModal(name, type, size) {
  const modal = document.getElementById("order-modal");
  const desc = document.getElementById("order-modal-desc");
  desc.textContent = `${name} — ${type} — Taille ${size}`;

  const message = encodeURIComponent(`Bonjour YoruShop, je souhaite commander : ${name} (${type}, taille ${size}).`);

  const waLink = document.getElementById("order-whatsapp");
  const igLink = document.getElementById("order-instagram");

  waLink.href = CONFIG.whatsapp === "WHATSAPP_URL" ? "#" : `${CONFIG.whatsapp}?text=${message}`;
  igLink.href = CONFIG.instagram === "INSTAGRAM_URL" ? "#" : CONFIG.instagram;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeOrderModal() {
  const modal = document.getElementById("order-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function initOrderModal() {
  document.getElementById("order-modal-close").addEventListener("click", closeOrderModal);
  document.getElementById("order-modal-backdrop").addEventListener("click", closeOrderModal);
  document.getElementById("order-contact").addEventListener("click", closeOrderModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOrderModal();
  });
}

// ===============================
// FAQ
// ===============================

function initFaq() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    const answer = btn.nextElementSibling;
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-question").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        b.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

// ===============================
// MENU MOBILE
// ===============================

function initMobileNav() {
  const header = document.getElementById("header");
  const hamburger = document.getElementById("hamburger");

  hamburger.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.querySelectorAll("#mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// ===============================
// LIENS DE CONTACT (CONFIG)
// ===============================

function initContactLinks() {
  const ig = document.getElementById("contact-instagram");
  const wa = document.getElementById("contact-whatsapp");
  const em = document.getElementById("contact-email");

  ig.href = CONFIG.instagram === "INSTAGRAM_URL" ? "#" : CONFIG.instagram;
  wa.href = CONFIG.whatsapp === "WHATSAPP_URL" ? "#" : CONFIG.whatsapp;
  em.href = CONFIG.email === "EMAIL_ADDRESS" ? "#" : `mailto:${CONFIG.email}`;
}

// ===============================
// APPARITION PROGRESSIVE DES SECTIONS
// ===============================

function initRevealOnScroll() {
  const sections = document.querySelectorAll("section");
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(16px)";
    section.style.transition = "opacity 500ms ease, transform 500ms ease";
    observer.observe(section);
  });
}

// ===============================
// INITIALISATION
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  populateFilterOptions();
  renderProducts();
  initFilters();
  initOrderModal();
  initFaq();
  initMobileNav();
  initContactLinks();
  initRevealOnScroll();
});
