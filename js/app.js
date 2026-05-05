// ============================================================
// WITNESS CHEF - Main App JS
// ============================================================

'use strict';

// ============================================================
// SPLASH SCREEN
// ============================================================
function dismissSplash() {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;
  splash.classList.add('dismissed');
  setTimeout(() => { splash.style.display = 'none'; }, 700);
  sessionStorage.setItem('witness_splash_seen', '1');
}

function initSplash() {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;
  // Auto-animate GET STARTED button in after 0.8s
  const cta = document.getElementById('splashCta');
  if (cta) setTimeout(() => cta.classList.add('visible'), 800);
  // If already seen this session, skip quickly
  if (sessionStorage.getItem('witness_splash_seen')) {
    setTimeout(dismissSplash, 400);
  }
}


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW failed:', err));
  });
}

// ============================================================
// STATE
// ============================================================
const State = {
  cart: JSON.parse(localStorage.getItem('witness_cart') || '[]'),
  currentSection: 'home',
  menuFilter: 'all',
  bookingStep: 1,
  selectedDate: null,
  calendarDate: new Date(),
  deferredInstallPrompt: null,
};

// ============================================================
// MENU DATA
// ============================================================
const MENU_ITEMS = [
  // Southern
  { id: 1, name: 'Smoked Oxtail Grillades', category: 'southern', desc: 'Slow-braised oxtail over stone-ground grits, collard green reduction, pickled okra.', price: 38, unit: 'per person', tags: ['southern'], icon: 'S' },
  { id: 2, name: 'Pecan-Crusted Catfish', category: 'southern', desc: 'Pan-seared catfish with pecan dust, remoulade, sweet potato mash, crispy shallots.', price: 32, unit: 'per person', tags: ['southern', 'pescatarian'], icon: 'S' },
  { id: 3, name: 'Low Country Boil Platter', category: 'southern', desc: 'Andouille, shrimp, corn, red potato medley in Old Bay broth — served family style.', price: 28, unit: 'per person', tags: ['southern', 'pescatarian'], icon: 'S' },
  { id: 4, name: 'Bourbon Peach Ribs', category: 'southern', desc: 'Slow-smoked pork ribs, bourbon-peach glaze, watermelon slaw, jalapeño cornbread.', price: 35, unit: 'per person', tags: ['southern'], icon: 'S' },
  // Vegan
  { id: 5, name: 'Black-Eyed Pea Croquettes', category: 'vegan', desc: 'Herbed black-eyed pea patties, roasted tomato coulis, arugula, pickled red onion.', price: 22, unit: 'per person', tags: ['vegan', 'southern'], icon: 'V' },
  { id: 6, name: 'Jollof Cauliflower Steak', category: 'vegan', desc: 'Whole roasted cauliflower in Jollof spice, coconut jus, plantain chips, herb oil.', price: 26, unit: 'per person', tags: ['vegan', 'nigerian'], icon: 'V' },
  { id: 7, name: 'Miso-Glazed Eggplant', category: 'vegan', desc: 'Charred Japanese eggplant, white miso glaze, sesame, microgreens, crispy tofu.', price: 24, unit: 'per person', tags: ['vegan', 'asian'], icon: 'V' },
  { id: 8, name: 'Garden Collard Wraps', category: 'vegan', desc: 'Raw collard leaves filled with quinoa, mango salsa, avocado, sunflower seed cream.', price: 20, unit: 'per person', tags: ['vegan'], icon: 'V' },
  // Pescatarian
  { id: 9, name: 'Jerk Salmon Tacos', category: 'pescatarian', desc: 'Scotch bonnet-jerk salmon, cabbage slaw, mango pico, coconut crema on corn tortillas.', price: 29, unit: 'per person', tags: ['pescatarian'], icon: 'P' },
  { id: 10, name: 'Shrimp & Grits Deluxe', category: 'pescatarian', desc: 'Gulf shrimp, andouille gravy, sharp cheddar grits, crispy tasso, scallion oil.', price: 33, unit: 'per person', tags: ['pescatarian', 'southern'], icon: 'P' },
  { id: 11, name: 'Crispy Snapper Escabeche', category: 'pescatarian', desc: 'Whole fried red snapper, escabeche vegetables, fried plantains, herb aioli.', price: 36, unit: 'per person', tags: ['pescatarian'], icon: 'P' },
  // Asian
  { id: 12, name: 'Korean BBQ Short Rib', category: 'asian', desc: 'Gochujang-marinated short rib, kimchi fried rice, scallion pancake, sesame glaze.', price: 40, unit: 'per person', tags: ['asian'], icon: 'A' },
  { id: 13, name: 'Tonkotsu Ramen Bowl', category: 'asian', desc: 'Rich pork-bone broth, chashu belly, soft egg, nori, bamboo, scallion, chili oil.', price: 27, unit: 'per person', tags: ['asian'], icon: 'A' },
  { id: 14, name: 'Mango Sticky Rice Set', category: 'asian', desc: 'Thai coconut sticky rice, fresh Ataulfo mango, sesame brittle, coconut cream drizzle.', price: 15, unit: 'per person', tags: ['asian', 'vegan'], icon: 'A' },
  // Nigerian
  { id: 15, name: 'Egusi Soup Experience', category: 'nigerian', desc: 'Ground melon seed stew, leafy greens, smoked fish, palm oil, pounded yam service.', price: 30, unit: 'per person', tags: ['nigerian'], icon: 'N' },
  { id: 16, name: 'Suya Beef Skewers', category: 'nigerian', desc: 'Hausa-spiced beef on skewer, groundnut dusting, raw onion, tomato, chili — tableside fire.', price: 25, unit: 'per person', tags: ['nigerian'], icon: 'N' },
  { id: 17, name: 'Pepper Soup Duo', category: 'nigerian', desc: 'Goat and catfish pepper soup served with yam, aromatic utazi and scent leaves.', price: 28, unit: 'per person', tags: ['nigerian', 'pescatarian'], icon: 'N' },
  { id: 18, name: 'Jollof Rice Grand Service', category: 'nigerian', desc: 'Party-style smoky Jollof, grilled chicken, fried plantain, Nigerian coleslaw.', price: 22, unit: 'per person', tags: ['nigerian'], icon: 'N' },
];

const OCCASIONS = [
  { icon: 'diamond', title: 'Intimate Dinner Party', desc: 'Curated multi-course experience for 4-12 guests with bespoke menu, table styling, and chef presence.' },
  { icon: 'wedding', title: 'Wedding Reception', desc: 'Full catering service from cocktail hour through reception. Custom stations, plating, staff included.' },
  { icon: 'birthday', title: 'Birthday Celebration', desc: 'Themed food stations tailored to honoree\'s favorite flavors. Custom cakes available on request.' },
  { icon: 'corporate', title: 'Corporate & Executive', desc: 'Professional lunch and dinner service for boardrooms, client entertainment, and team retreats.' },
  { icon: 'holiday', title: 'Holiday Gathering', desc: 'Thanksgiving, Kwanzaa, Eid, and seasonal celebration menus rooted in tradition and elevated craft.' },
  { icon: 'popup', title: 'Pop-Up Supper Club', desc: 'Curated ticketed dining experience for up to 40 guests. Location, theme, and menu crafted together.' },
];

const DELIVERY_SERVICES = [
  { name: 'Uber Eats', abbr: 'UE', color: '#06C167', info: 'Delivery across Lisbon & Porto', status: 'active', url: '#' },
  { name: 'Glovo', abbr: 'GL', color: '#FFC244', info: 'Portugal-wide coverage', status: 'active', url: '#' },
  { name: 'Bolt Food', abbr: 'BF', color: '#34D186', info: 'Express delivery option', status: 'active', url: '#' },
  { name: 'Takeaway.com', abbr: 'TW', color: '#FF6B00', info: 'Major cities in Portugal', status: 'active', url: '#' },
  { name: 'DoorDash', abbr: 'DD', color: '#FF3008', info: 'Coming soon', status: 'coming', url: '#' },
  { name: 'Direct Pickup', abbr: 'DP', color: '#c9a84c', info: 'Schedule your own pickup', status: 'active', url: '#booking' },
];

const TESTIMONIALS = [
  { id: 1, text: 'Witness prepared a seven-course dinner for my wedding anniversary. Every dish told a story. The Egusi Soup took me back to Lagos while the Korean Short Rib showed pure mastery. Absolutely transcendent.', author: 'Amara O.', event: 'Anniversary Dinner, Lisbon', stars: 5, initials: 'AO' },
  { id: 2, text: 'We booked a pop-up supper club for 30 guests. The Low Country Boil followed by that Miso Eggplant — people are still talking about it. Witness does not compromise on anything.', author: 'Marcus B.', event: 'Corporate Event, Porto', stars: 5, initials: 'MB' },
  { id: 3, text: 'As someone plant-based, finding a personal chef who treats vegan food with the same reverence as any other cuisine is rare. The Black-Eyed Pea Croquettes were incredible. Booked again immediately.', author: 'Chidinma E.', event: 'Private Dinner, Cascais', stars: 5, initials: 'CE' },
  { id: 4, text: 'The Kwanzaa feast was beyond what I imagined. Witness brought every tradition to life on the plate. The attention to cultural detail was profound and deeply moving.', author: 'Josephine R.', event: 'Kwanzaa Celebration', stars: 5, initials: 'JR' },
  { id: 5, text: 'From the first tasting to the final plate cleared, complete professionalism. The Suya Skewers served tableside were a showstopper. Our guests want a standing booking.', author: 'Elena M.', event: 'Birthday Gala, Sintra', stars: 5, initials: 'EM' },
  { id: 6, text: 'Booked for a 50th birthday. Witness merged Southern comfort and Nigerian celebration into one unforgettable menu. The smoky Jollof and the Bourbon Ribs together? Genius.', author: 'David A.', event: '50th Birthday, Lagos/Lisbon hybrid theme', stars: 5, initials: 'DA' },
];

const POPUP_EVENTS = [
  { day: 14, month: 'Jun', title: 'Summer Supper Club — Ocean-to-Table', location: 'Cascais, Portugal', time: '19:30', type: 'popup', seats: 8 },
  { day: 22, month: 'Jun', title: 'Nigerian Heritage Dinner Series', location: 'Lisbon Private Venue', time: '20:00', type: 'private', seats: 4 },
  { day: 5, month: 'Jul', title: 'Vegan Feast & Market Pickup', location: 'Mercado de Campo de Ourique', time: '12:00', type: 'delivery', seats: 12 },
  { day: 19, month: 'Jul', title: 'Korean-Southern Fusion Experience', location: 'Porto Studio Kitchen', time: '19:00', type: 'popup', seats: 6 },
];

// ============================================================
// CART
// ============================================================
const Cart = {
  save() { localStorage.setItem('witness_cart', JSON.stringify(State.cart)); },
  add(item) {
    const existing = State.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else State.cart.push({ ...item, qty: 1 });
    this.save();
    this.render();
    showToast(`${item.name} added to order`, 'success');
  },
  remove(id) {
    State.cart = State.cart.filter(i => i.id !== id);
    this.save();
    this.render();
  },
  updateQty(id, delta) {
    const item = State.cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(id);
    else { this.save(); this.render(); }
  },
  total() { return State.cart.reduce((s, i) => s + (i.price * i.qty), 0); },
  count() { return State.cart.reduce((s, i) => s + i.qty, 0); },
  render() {
    const count = this.count();
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = count;
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.style.display = count > 0 ? 'flex' : 'none';

    const itemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!itemsEl) return;

    if (State.cart.length === 0) {
      itemsEl.innerHTML = `<div style="text-align:center;padding:3rem 0;color:var(--text-muted);font-family:var(--font-ui);font-size:0.85rem;">Your order is empty.<br>Browse the menu to add dishes.</div>`;
    } else {
      itemsEl.innerHTML = State.cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">${item.icon}</div>
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">€${item.price} ${item.unit || ''}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="Cart.updateQty(${item.id}, -1)">-</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="Cart.updateQty(${item.id}, 1)">+</button>
              <button class="qty-btn" onclick="Cart.remove(${item.id})" style="margin-left:0.4rem;color:#e06060;" title="Remove">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
    if (totalEl) totalEl.textContent = `€${this.total().toFixed(2)}`;
  }
};

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  const items = State.menuFilter === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === State.menuFilter || i.tags.includes(State.menuFilter));
  grid.innerHTML = items.map(item => `
    <div class="menu-card fade-in" data-category="${item.category}">
      <div class="menu-img">
        ${item.icon}
        <div class="menu-img-overlay"></div>
        <div class="menu-tag">
          <span class="badge badge-${item.category === 'vegan' ? 'green' : item.category === 'southern' ? 'gold' : 'sage'}">${item.category}</span>
        </div>
      </div>
      <div class="menu-body">
        <div class="menu-name">${item.name}</div>
        <div class="menu-desc">${item.desc}</div>
        <div class="menu-footer">
          <div class="menu-price">€${item.price} <small>${item.unit}</small></div>
          <button class="add-btn" onclick="Cart.add(MENU_ITEMS.find(i=>i.id===${item.id}))" title="Add to order">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  observeFadeIns();
}

function renderDelivery() {
  const grid = document.getElementById('deliveryGrid');
  if (!grid) return;
  grid.innerHTML = DELIVERY_SERVICES.map(d => `
    <div class="delivery-card ${d.status === 'active' ? '' : ''}" onclick="selectDelivery(this, '${d.name}', '${d.url}')">
      <div class="delivery-logo" style="background:${d.color}20;color:${d.color};border:2px solid ${d.color}40;font-size:0.8rem;letter-spacing:0.05em;">${d.abbr}</div>
      <div class="delivery-name">${d.name}</div>
      <div class="delivery-info">${d.info}</div>
      <span class="delivery-status status-${d.status}">${d.status === 'active' ? 'Available' : 'Coming Soon'}</span>
    </div>
  `).join('');
}

function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card fade-in">
      <div class="testimonial-stars">${'<div class="star"></div>'.repeat(t.stars)}</div>
      <div class="testimonial-text">${t.text}</div>
      <div class="testimonial-author">
        <div class="author-avatar">${t.initials}</div>
        <div>
          <div class="author-name">${t.author}</div>
          <div class="author-event">${t.event}</div>
        </div>
      </div>
    </div>
  `).join('');
  observeFadeIns();
}

function renderOccasions() {
  const grid = document.getElementById('occasionsGrid');
  if (!grid) return;
  const icons = {
    diamond: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/></svg>`,
    wedding: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    birthday: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    corporate: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    holiday: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    popup: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  };
  grid.innerHTML = OCCASIONS.map(o => `
    <div class="occasion-card fade-in" onclick="openBookingModal('${o.title}')">
      <div class="occasion-icon">${icons[o.icon] || ''}</div>
      <div class="occasion-title">${o.title}</div>
      <div class="occasion-desc">${o.desc}</div>
      <a href="#booking" class="btn btn-outline btn-sm" onclick="event.stopPropagation();scrollToSection('booking')">Inquire</a>
    </div>
  `).join('');
  observeFadeIns();
}

function renderPopups() {
  const list = document.getElementById('popupList');
  if (!list) return;
  const colors = { popup: '#c9a84c', private: '#9b6dff', delivery: '#6dbf6d' };
  list.innerHTML = POPUP_EVENTS.map(e => `
    <div class="popup-event">
      <div class="popup-date">
        <div class="popup-day">${e.day}</div>
        <div class="popup-month">${e.month}</div>
      </div>
      <div class="popup-info">
        <div class="popup-title">${e.title}</div>
        <div class="popup-details">
          <span class="popup-detail">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            ${e.location}
          </span>
          <span class="popup-detail">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${e.time}
          </span>
          <span class="popup-detail">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${e.seats} seats left
          </span>
        </div>
      </div>
      <div class="popup-actions">
        <span class="badge" style="background:${colors[e.type]}20;color:${colors[e.type]};border:1px solid ${colors[e.type]}40;font-family:var(--font-ui);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.2rem 0.7rem;border-radius:20px;">${e.type}</span>
        <button class="btn btn-primary btn-sm" onclick="openBookingModal('${e.title}')">Reserve</button>
      </div>
    </div>
  `).join('');
}

// ============================================================
// CALENDAR
// ============================================================
const Calendar = {
  events: [
    { date: '2026-06-14', type: 'popup' },
    { date: '2026-06-22', type: 'private' },
    { date: '2026-07-05', type: 'delivery' },
    { date: '2026-07-19', type: 'popup' },
  ],
  render() {
    const d = State.calendarDate;
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const el = document.getElementById('calendarMonth');
    if (el) el.textContent = `${monthNames[month]} ${year}`;

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let html = days.map(d => `<div class="cal-day-label">${d}</div>`).join('');

    // Empty cells
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty other-month"></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const hasEvent = this.events.some(e => e.date === dateStr);
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
      const isSelected = State.selectedDate === dateStr;
      const cls = ['cal-day', isToday ? 'today' : '', hasEvent ? 'has-event' : '', isSelected ? 'selected' : ''].filter(Boolean).join(' ');
      html += `<div class="${cls}" onclick="Calendar.selectDay('${dateStr}', ${day})">${day}</div>`;
    }
    grid.innerHTML = html;
  },
  selectDay(dateStr, day) {
    State.selectedDate = dateStr;
    this.render();
    const input = document.getElementById('bookingDate');
    if (input) input.value = dateStr;
    showToast(`${dateStr} selected for booking`, 'success');
  },
  prev() {
    State.calendarDate = new Date(State.calendarDate.getFullYear(), State.calendarDate.getMonth() - 1, 1);
    this.render();
  },
  next() {
    State.calendarDate = new Date(State.calendarDate.getFullYear(), State.calendarDate.getMonth() + 1, 1);
    this.render();
  }
};

// ============================================================
// BOOKING
// ============================================================
function submitBooking(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  // Simulate submission
  showToast('Booking request sent! We will confirm within 24 hours.', 'success');
  form.reset();
  State.selectedDate = null;
  Calendar.render();
  closeAllModals();
}

function openBookingModal(occasion = '') {
  const modal = document.getElementById('bookingModal');
  if (!modal) { scrollToSection('booking'); return; }
  modal.querySelector('.modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (occasion) {
    const input = document.getElementById('bookingOccasion');
    if (input) input.value = occasion;
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

// ============================================================
// REVIEW UPLOAD
// ============================================================
function setupReviewUpload() {
  const area = document.getElementById('uploadArea');
  const input = document.getElementById('photoInput');
  if (!area || !input) return;

  area.addEventListener('click', () => input.click());
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  input.addEventListener('change', e => handleFiles(e.target.files));

  function handleFiles(files) {
    const preview = document.getElementById('photoPreview');
    if (!preview) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const img = document.createElement('div');
        img.style.cssText = `width:80px;height:80px;border-radius:4px;overflow:hidden;border:1px solid var(--border);flex-shrink:0;`;
        img.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
}

function submitReview(e) {
  e.preventDefault();
  showToast('Review submitted. Thank you for sharing your experience.', 'success');
  e.target.reset();
  const preview = document.getElementById('photoPreview');
  if (preview) preview.innerHTML = '';
}

// ============================================================
// DELIVERY
// ============================================================
function selectDelivery(el, name, url) {
  document.querySelectorAll('.delivery-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  if (url && url !== '#') {
    showToast(`Opening ${name}...`, 'success');
    setTimeout(() => window.open(url, '_blank'), 800);
  } else if (url === '#booking') {
    scrollToSection('booking');
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveNav();
  });

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 120;
  sections.forEach(s => {
    const links = document.querySelectorAll(`.nav-links a[href="#${s.id}"]`);
    if (scrollY >= s.offsetTop && scrollY < s.offsetTop + s.offsetHeight) {
      links.forEach(l => l.classList.add('active'));
    } else {
      links.forEach(l => l.classList.remove('active'));
    }
  });
}

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-text">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ============================================================
// FADE IN OBSERVER
// ============================================================
function observeFadeIns() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
}

// ============================================================
// PWA INSTALL
// ============================================================
function setupInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    State.deferredInstallPrompt = e;
    const banner = document.getElementById('installBanner');
    if (banner) setTimeout(() => banner.classList.add('show'), 5000);
  });

  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!State.deferredInstallPrompt) return;
      State.deferredInstallPrompt.prompt();
      const { outcome } = await State.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Witness Chef installed successfully.', 'success');
        document.getElementById('installBanner').classList.remove('show');
      }
      State.deferredInstallPrompt = null;
    });
  }

  const dismissBtn = document.getElementById('dismissInstall');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      document.getElementById('installBanner').classList.remove('show');
    });
  }
}

// ============================================================
// MENU FILTERS
// ============================================================
function setupMenuFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.menuFilter = btn.dataset.filter;
      renderMenu();
    });
  });
}

// ============================================================
// CART DRAWER
// ============================================================
function setupCart() {
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const backdrop = document.getElementById('backdrop');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cartBtn) cartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  function closeCart() {
    cartDrawer.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (backdrop) backdrop.addEventListener('click', closeCart);

  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if (State.cart.length === 0) { showToast('Add items to your order first.', 'error'); return; }
    closeCart();
    openCheckoutModal();
  });
}

function openCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.querySelector('.modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Init splash
  initSplash();

  // Render all sections
  renderMenu();
  renderDelivery();
  renderTestimonials();
  renderOccasions();
  renderPopups();
  Calendar.render();

  // Setup
  setupNav();
  setupCart();
  setupMenuFilters();
  setupReviewUpload();
  setupInstall();

  // Initial render
  Cart.render();
  observeFadeIns();

  // Modal close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) { e.preventDefault(); scrollToSection(id); }
    });
  });

  // Booking form
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) bookingForm.addEventListener('submit', submitBooking);

  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) reviewForm.addEventListener('submit', submitReview);

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) checkoutForm.addEventListener('submit', e => {
    e.preventDefault();
    State.cart = [];
    Cart.save();
    Cart.render();
    closeAllModals();
    showToast('Order confirmed. You will receive a confirmation shortly.', 'success');
  });

  // Scroll reveal on all existing fade-in elements
  const initObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); initObserver.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => initObserver.observe(el));
});
