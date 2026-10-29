/* Amancay Floristería — interacción de la tienda */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const catLabel = id => CATEGORIES.find(c => c.id === id)?.label || '';
  const WHATSAPP = '51987654321';

  let storage = null;
  try { storage = window.localStorage; storage.getItem('x'); } catch { storage = null; }
  const cart = createCart(PRODUCTS, storage);
  let zone = DELIVERY_ZONES[1].id;

  const ICON_BAG = '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/><path d="M12 11v5M9.5 13.5h5"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
  const ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.03c-.25.69-1.45 1.32-2 1.4-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07s.77-2.18 1.04-2.48c.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.05 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.08.12.08.72-.17 1.41z"/></svg>';

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function addToCart(id, qty = 1) {
    cart.add(id, qty);
    const p = PRODUCTS.find(x => x.id === id);
    toast(`✓ ${p.name} agregado al carrito`);
    const c = $('#cartCount');
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }

  /* ---------- Hero carrusel ---------- */
  const featured = PRODUCTS.filter(p => p.featured);
  const DURATION = 6000;
  let current = 0, timer = null, startTime = 0, elapsed = 0, paused = false, raf;

  function renderHero() {
    $('#heroTrack').innerHTML = featured.map((p, i) => `
      <article class="slide${i === 0 ? ' active' : ''}" aria-roledescription="diapositiva" aria-label="${i + 1} de ${featured.length}">
        <img class="slide__img" src="${IMG(p.img, 1800)}" alt="${esc(p.name)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
        <div class="container slide__content">
          <span class="slide__tag">✦ Destacado · ${catLabel(p.category)}</span>
          <h1>${esc(p.name)}</h1>
          <p class="slide__tagline">${esc(p.tagline || '')}</p>
          <p class="slide__price">Desde <strong>${money(p.price)}</strong>${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</p>
          <div class="slide__ctas">
            <button class="btn btn--light" data-add="${p.id}">${ICON_BAG} Agregar al carrito</button>
            <button class="btn btn--ghost" data-view="${p.id}">Ver detalle</button>
          </div>
        </div>
      </article>`).join('');
    $('#heroDots').innerHTML = featured.map((p, i) =>
      `<button class="hero__dot${i === 0 ? ' active' : ''}" role="tab" aria-label="Ir a ${esc(p.name)}" data-dot="${i}"></button>`).join('');
  }

  function goTo(i) {
    const slides = $$('.slide'), dots = $$('.hero__dot');
    slides[current].classList.remove('active'); dots[current].classList.remove('active');
    current = (i + featured.length) % featured.length;
    slides[current].classList.add('active'); dots[current].classList.add('active');
    elapsed = 0; startTime = performance.now();
  }

  function tick(now) {
    if (!paused) {
      const progress = elapsed + (now - startTime);
      $('#heroProgress').style.width = Math.min(progress / DURATION * 100, 100) + '%';
      if (progress >= DURATION) goTo(current + 1);
    }
    raf = requestAnimationFrame(tick);
  }

  function pause() { if (!paused) { paused = true; elapsed += performance.now() - startTime; } }
  function resume() { if (paused) { paused = false; startTime = performance.now(); } }

  function initHero() {
    renderHero();
    startTime = performance.now();
    raf = requestAnimationFrame(tick);
    $('#heroPrev').onclick = () => goTo(current - 1);
    $('#heroNext').onclick = () => goTo(current + 1);
    $('#heroDots').onclick = e => { const d = e.target.closest('[data-dot]'); if (d) goTo(+d.dataset.dot); };
    const hero = $('.hero');
    hero.addEventListener('mouseenter', pause);
    hero.addEventListener('mouseleave', resume);
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
    let x0 = null;
    hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    document.addEventListener('keydown', e => {
      if (!$('#modal').hidden || !$('#checkout').hidden || document.activeElement.matches('input, select, textarea')) return;
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });
  }

  /* ---------- Ocasiones ---------- */
  const OCCASIONS = [
    { cat: 'enamorados', title: 'Enamorados', sub: 'Rosas y corazones', img: '1518895949257-7621c3c786d7' },
    { cat: 'bodas', title: 'Bodas y aniversarios', sub: 'Para recién casados', img: '1465495976277-4387d4b0b4c6' },
    { cat: 'peluches', title: 'Con peluche', sub: 'Ternura que abraza', img: '1559454403-b8fb88521f11' },
    { cat: 'orquideas', title: 'Orquídeas', sub: 'Elegancia que perdura', img: '1610397648930-477b8c7f0943' }
  ];
  function renderOccasions() {
    $('#occasionsGrid').innerHTML = OCCASIONS.map(o => `
      <button class="occasion reveal" data-occasion="${o.cat}">
        <img src="${IMG(o.img, 600)}" alt="" loading="lazy">
        <div><h3>${o.title}</h3><span>${o.sub} →</span></div>
      </button>`).join('');
    $('#occasionsGrid').onclick = e => {
      const b = e.target.closest('[data-occasion]');
      if (!b) return;
      setFilter(b.dataset.occasion);
      $('#catalogo').scrollIntoView();
    };
  }

  /* ---------- Catálogo ---------- */
  const state = { cat: 'todos', q: '', sort: 'default' };

  function renderFilters() {
    $('#filters').innerHTML = CATEGORIES.map(c =>
      `<button class="chip${c.id === state.cat ? ' active' : ''}" role="tab" aria-selected="${c.id === state.cat}" data-cat="${c.id}">${c.label}</button>`).join('');
  }

  function setFilter(cat) { state.cat = cat; renderFilters(); renderGrid(); }

  function renderGrid() {
    const q = state.q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let list = PRODUCTS.filter(p =>
      (state.cat === 'todos' || p.category === state.cat) &&
      (!q || norm(p.name + ' ' + p.description + ' ' + catLabel(p.category)).includes(q)));
    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'name': (a, b) => a.name.localeCompare(b.name, 'es')
    };
    if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);

    $('#results').textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'}`;
    $('#productGrid').innerHTML = list.length ? list.map((p, i) => `
      <article class="card" style="animation-delay:${Math.min(i, 8) * 40}ms">
        <div class="card__media" data-view="${p.id}">
          <img src="${IMG(p.img, 600)}" alt="${esc(p.name)}" loading="lazy">
          ${p.oldPrice ? `<span class="badge badge--sale">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`
            : p.badge ? `<span class="badge">${p.badge}</span>` : ''}
          <button class="card__quick" data-view="${p.id}">Vista rápida</button>
        </div>
        <div class="card__body">
          <span class="card__cat">${catLabel(p.category)}</span>
          <h3 class="card__name">${esc(p.name)}</h3>
          <div class="card__foot">
            <span class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</span>
            <button class="add-btn" data-add="${p.id}" aria-label="Agregar ${esc(p.name)} al carrito">${ICON_BAG}</button>
          </div>
        </div>
      </article>`).join('')
      : `<div class="empty">No encontramos productos para “${esc(state.q)}”. Prueba con otra búsqueda.</div>`;
  }

  function initCatalog() {
    renderFilters();
    renderGrid();
    $('#filters').onclick = e => { const c = e.target.closest('[data-cat]'); if (c) setFilter(c.dataset.cat); };
    $('#search').oninput = e => { state.q = e.target.value; renderGrid(); };
    $('#sort').onchange = e => { state.sort = e.target.value; renderGrid(); };
  }

  /* ---------- Delegación global: agregar / ver ---------- */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) {
      addToCart(+add.dataset.add);
      if (add.classList.contains('add-btn')) {
        add.classList.add('added'); add.innerHTML = ICON_CHECK;
        setTimeout(() => { add.classList.remove('added'); add.innerHTML = ICON_BAG; }, 1200);
      }
      return;
    }
    const view = e.target.closest('[data-view]');
    if (view) openProduct(+view.dataset.view);
  });

  /* ---------- Modal ---------- */
  let lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    $('#modalCard').innerHTML = `<button class="icon-btn modal__close" data-close aria-label="Cerrar">${ICON_CLOSE}</button>` + html;
    $('#modal').hidden = false;
    document.body.classList.add('lock');
    pause();
    $('#modalCard').querySelector('button, input')?.focus();
  }
  function closeModal() {
    $('#modal').hidden = true;
    if (!$('#cart').classList.contains('open')) document.body.classList.remove('lock');
    resume();
    lastFocus?.focus?.();
  }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });

  function openProduct(id) {
    const p = PRODUCTS.find(x => x.id === id);
    let qty = 1;
    openModal(`
      <div class="pdetail">
        <img src="${IMG(p.img, 900)}" alt="${esc(p.name)}">
        <div class="pdetail__info">
          <span class="card__cat">${catLabel(p.category)}</span>
          <h2>${esc(p.name)}</h2>
          <span class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</span>
          <p>${esc(p.description)}</p>
          <ul>
            <li>✓ Tarjeta con dedicatoria incluida</li>
            <li>✓ Entrega el mismo día pidiendo antes de las 4:00 p. m.</li>
            <li>✓ Garantía de frescura de 5 días</li>
          </ul>
          <div class="pdetail__actions">
            <div class="qty"><button data-q="-1" aria-label="Menos">−</button><span id="pq">1</span><button data-q="1" aria-label="Más">+</button></div>
            <button class="btn btn--primary" id="pAdd">${ICON_BAG} Agregar · <span id="pTotal">${money(p.price)}</span></button>
          </div>
        </div>
      </div>`);
    $('#modalCard').onclick = e => {
      const q = e.target.closest('[data-q]');
      if (q) {
        qty = Math.max(1, Math.min(20, qty + +q.dataset.q));
        $('#pq').textContent = qty;
        $('#pTotal').textContent = money(p.price * qty);
      }
      if (e.target.closest('#pAdd')) { addToCart(p.id, qty); closeModal(); }
    };
  }

  /* ---------- Carrito ---------- */
  function openCart() {
    $('#cart').classList.add('open'); $('#cart').setAttribute('aria-hidden', 'false');
    $('#overlay').hidden = false; document.body.classList.add('lock');
    $('#cartClose').focus();
  }
  function closeCart() {
    $('#cart').classList.remove('open'); $('#cart').setAttribute('aria-hidden', 'true');
    $('#overlay').hidden = true; document.body.classList.remove('lock');
  }

  function renderCart() {
    const lines = cart.lines();
    const count = cart.count();
    $('#cartCount').textContent = count;
    $('#cartFoot').hidden = !count;
    $('#cartBody').innerHTML = count ? lines.map(({ product: p, qty, total }) => `
      <div class="line">
        <img src="${IMG(p.img, 200)}" alt="">
        <div>
          <h4>${esc(p.name)}</h4>
          <span class="line__unit">${money(p.price)} c/u</span><br>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Quitar uno">−</button><span>${qty}</span><button data-inc="${p.id}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <div class="line__right">
          <strong>${money(total)}</strong>
          <button class="line__remove" data-remove="${p.id}">Eliminar</button>
        </div>
      </div>`).join('')
      : `<div class="cart-empty"><div>💐</div><p>Tu carrito está vacío.<br>¡Llena tu día de flores!</p><button class="btn btn--primary" id="goShop">Ver catálogo</button></div>`;

    const sub = cart.subtotal(), disc = cart.discount();
    const missing = FREE_DELIVERY_FROM - (sub - disc);
    $('#freeBar').innerHTML = (missing > 0
      ? `Te faltan <strong>${money(missing)}</strong> para delivery gratis`
      : '🎉 ¡Tienes delivery gratis!') +
      `<div class="free-bar__track"><span style="width:${Math.min((sub - disc) / FREE_DELIVERY_FROM * 100, 100)}%"></span></div>`;
    $('#subtotal').textContent = money(sub);
    $('#discountRow').hidden = !disc;
    $('#discountLabel').textContent = `Descuento (${cart.coupon()?.code || ''})`;
    $('#discount').textContent = '− ' + money(disc);
    $('#zone').value = zone;
    const d = cart.delivery(zone);
    $('#deliveryCost').textContent = d ? money(d) : 'Gratis';
    $('#grandTotal').textContent = money(cart.total(zone));
  }

  function initCart() {
    $('#zone').innerHTML = DELIVERY_ZONES.map(z =>
      `<option value="${z.id}"${z.id === zone ? ' selected' : ''}>${z.label}${z.cost ? ' — ' + money(z.cost) : ' — Gratis'}</option>`).join('');
    $('#zone').onchange = e => { zone = e.target.value; renderCart(); };
    $('#cartOpen').onclick = openCart;
    $('#cartClose').onclick = closeCart;
    $('#overlay').onclick = closeCart;
    $('#cartBody').onclick = e => {
      const t = e.target.closest('button'); if (!t) return;
      if (lineAction(t)) return;
      if (t.id === 'goShop') { closeCart(); $('#catalogo').scrollIntoView(); }
    };
    $('#clearCart').onclick = () => { if (confirm('¿Vaciar el carrito?')) cart.clear(); };
    $('#viewCartBtn').onclick = () => openCheckout(1);
    $('#checkoutBtn').onclick = () => openCheckout(2);
    cart.onChange(renderCart);
    cart.onChange(() => {
      if ($('#checkout').hidden || co.step === 'done') return;
      // En el paso de entrega solo se actualiza el resumen para no perder lo escrito
      if (co.step === 1 || !cart.count()) renderCheckout(); else renderSummary();
    });
    renderCart();
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!$('#modal').hidden) closeModal(); else closeCart();
    });
  }

  // Botones +, − y eliminar de una línea del carrito (panel y página de carrito)
  function lineAction(t) {
    const qtyOf = id => cart.lines().find(l => l.product.id === id)?.qty || 0;
    if (t.dataset.inc) cart.setQty(+t.dataset.inc, qtyOf(+t.dataset.inc) + 1);
    else if (t.dataset.dec) cart.setQty(+t.dataset.dec, qtyOf(+t.dataset.dec) - 1);
    else if (t.dataset.remove) cart.remove(+t.dataset.remove);
    else return false;
    return true;
  }

  /* ---------- Checkout estándar: Carrito → Entrega → Pago (cierre por WhatsApp) ---------- */
  const PAYMENTS = [
    { id: 'Yape', icon: '📱', label: 'Yape', note: 'Te enviamos el QR por WhatsApp' },
    { id: 'Plin', icon: '📲', label: 'Plin', note: 'Te enviamos el número por WhatsApp' },
    { id: 'Transferencia', icon: '🏦', label: 'Transferencia bancaria', note: 'BCP, Interbank o BBVA' },
    { id: 'Tarjeta', icon: '💳', label: 'Tarjeta crédito / débito', note: 'Te enviamos un link de pago seguro' }
  ];
  const HORARIOS = ['9:00 a. m. – 1:00 p. m.', '1:00 p. m. – 5:00 p. m.', '5:00 p. m. – 9:00 p. m.'];
  const co = { step: 1, data: {}, pago: 'Yape', order: null };
  const localISO = d => d.toLocaleDateString('en-CA');
  const longDate = iso => new Date(iso + 'T12:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  const zoneOf = () => DELIVERY_ZONES.find(z => z.id === zone);

  function openCheckout(step = 1) {
    closeCart();
    co.step = cart.count() ? step : 1;
    $('#checkout').classList.remove('co--done');
    $('#checkout').hidden = false;
    document.body.classList.add('lock');
    pause();
    if (location.hash !== '#carrito') history.pushState(null, '', '#carrito');
    renderCheckout();
    $('#checkout').scrollTo(0, 0);
  }
  function hideCheckout() {
    $('#checkout').hidden = true;
    document.body.classList.remove('lock');
    resume();
  }
  function closeCheckout() { if (location.hash === '#carrito') history.back(); else hideCheckout(); }
  addEventListener('popstate', () => { if (location.hash !== '#carrito' && !$('#checkout').hidden) hideCheckout(); });

  function goStep(n) { co.step = n; renderCheckout(); $('#checkout').scrollTo({ top: 0, behavior: 'smooth' }); }

  function renderCheckout() {
    if (!cart.count()) co.step = 1;
    $$('#steps li').forEach((li, i) => {
      li.classList.toggle('active', i + 1 === co.step);
      li.classList.toggle('done', i + 1 < co.step);
    });
    $('#coMain').innerHTML = [null, stepCart, stepDelivery, stepPayment][co.step]();
    renderSummary();
  }

  function stepCart() {
    const lines = cart.lines();
    if (!lines.length) return `
      <div class="co-empty"><div>💐</div><h2>Tu carrito está vacío</h2>
        <p>Explora nuestro catálogo y encuentra el detalle perfecto.</p>
        <button class="btn btn--primary" data-co="close">Ir al catálogo</button></div>`;
    return `
      <h1 class="co__title">Carrito de compras <small>(${cart.count()} ${cart.count() === 1 ? 'producto' : 'productos'})</small></h1>
      <div class="co-table">
        <div class="co-table__head"><span>Producto</span><span>Precio</span><span>Cantidad</span><span>Total</span><span></span></div>
        ${lines.map(({ product: p, qty, total }) => `
          <div class="co-row">
            <div class="co-row__prod">
              <img src="${IMG(p.img, 200)}" alt="">
              <div><span class="card__cat">${catLabel(p.category)}</span><h3>${esc(p.name)}</h3></div>
            </div>
            <span class="co-row__price">${money(p.price)}</span>
            <div class="qty"><button data-dec="${p.id}" aria-label="Quitar uno">−</button><span>${qty}</span><button data-inc="${p.id}" aria-label="Agregar uno">+</button></div>
            <strong class="co-row__total">${money(total)}</strong>
            <button class="icon-btn co-row__remove" data-remove="${p.id}" aria-label="Eliminar ${esc(p.name)}">${ICON_TRASH}</button>
          </div>`).join('')}
      </div>
      <div class="co__links">
        <button class="link-back" data-co="close">← Seguir comprando</button>
        <button class="link-btn" data-co="clear">Vaciar carrito</button>
      </div>`;
  }

  function stepDelivery() {
    const d = co.data, today = new Date(), tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const pickup = zone === 'recojo';
    const val = k => esc(d[k] || '');
    return `
      <h1 class="co__title">Datos de entrega</h1>
      <form id="coForm" novalidate>
        <div class="co-card">
          <h2>¿Quién compra?</h2>
          <div class="co-grid2">
            <label class="field"><span>Nombre completo *</span><input name="nombre" required autocomplete="name" value="${val('nombre')}"></label>
            <label class="field"><span>Celular (WhatsApp) *</span><input name="celular" required inputmode="tel" pattern="9\\d{8}" placeholder="9XXXXXXXX" autocomplete="tel" value="${val('celular')}"></label>
          </div>
          <label class="field"><span>Correo electrónico</span><input type="email" name="correo" autocomplete="email" value="${val('correo')}"></label>
        </div>
        <div class="co-card">
          <h2>¿A dónde lo enviamos?</h2>
          <label class="field"><span>Tipo de entrega *</span>
            <select name="zona" id="coZone">${DELIVERY_ZONES.map(z =>
              `<option value="${z.id}"${z.id === zone ? ' selected' : ''}>${z.label} — ${z.cost ? money(z.cost) : 'Gratis'}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Nombre de quien recibe *</span><input name="destinatario" required value="${val('destinatario')}"></label>
          <label class="field"><span>Dirección de entrega${pickup ? '' : ' *'}</span>
            <input name="direccion" id="coAddress" ${pickup ? 'disabled placeholder="Recojo en Av. José Larco 845, Miraflores"' : 'required placeholder="Calle, número, distrito y referencia"'} autocomplete="street-address" value="${pickup ? '' : val('direccion')}"></label>
          <div class="co-grid2">
            <label class="field"><span>Fecha de entrega *</span><input type="date" name="fecha" required min="${localISO(today)}" value="${val('fecha') || localISO(tomorrow)}"></label>
            <label class="field"><span>Horario</span><select name="horario">${HORARIOS.map(h =>
              `<option${h === d.horario ? ' selected' : ''}>${h}</option>`).join('')}</select></label>
          </div>
          <label class="field"><span>Dedicatoria para la tarjeta (opcional)</span><textarea name="dedicatoria" rows="3" maxlength="200" placeholder="Escribe tu mensaje…">${val('dedicatoria')}</textarea></label>
        </div>
      </form>
      <div class="co__links"><button class="link-back" data-co="back">← Volver al carrito</button></div>`;
  }

  function stepPayment() {
    co.order ||= 'AM-' + Date.now().toString().slice(-6);
    const d = co.data;
    return `
      <h1 class="co__title">Forma de pago</h1>
      <div class="co-card co-review">
        <div>
          <h2>Entrega</h2>
          <p><strong>${esc(d.destinatario)}</strong> · ${esc(d.direccion || 'Recojo en tienda')}</p>
          <p>${zoneOf().label}</p>
          <p>${longDate(d.fecha)}, ${esc(d.horario)}</p>
        </div>
        <button class="link-btn" data-co="back">Editar</button>
      </div>
      <div class="co-card">
        <h2>¿Cómo deseas pagar?</h2>
        <div class="co-pay">${PAYMENTS.map(p => `
          <label${p.id === co.pago ? ' class="selected"' : ''}><input type="radio" name="pago" value="${p.id}"${p.id === co.pago ? ' checked' : ''}>
            <span class="co-pay__icon">${p.icon}</span><span><strong>${p.label}</strong><small>${p.note}</small></span></label>`).join('')}
        </div>
      </div>
      <div class="co-wa">
        <div>
          <h3>Cierra tu compra por WhatsApp</h3>
          <p>Abriremos un chat con un asesor con el detalle de tu pedido <strong>${co.order}</strong>. Te confirmará disponibilidad y te enviará los datos para pagar con <strong id="waPay">${co.pago}</strong>.</p>
        </div>
        <a class="btn btn--wa" id="waBtn" href="${waLink()}" target="_blank" rel="noopener">${ICON_WA} Comprar por WhatsApp</a>
      </div>
      <p class="co-secure">🔒 Tus datos solo se usan para coordinar tu pedido y la entrega.</p>
      <div class="co__links"><button class="link-back" data-co="back">← Volver a entrega</button></div>`;
  }

  function waLink() {
    const d = co.data, disc = cart.discount(), del = cart.delivery(zone);
    const msg = [
      'Hola Amancay 🌸, quiero completar mi compra.',
      `*Pedido ${co.order}*`,
      ...cart.lines().map(l => `• ${l.qty} × ${l.product.name} — ${money(l.total)}`),
      `Subtotal: ${money(cart.subtotal())}`,
      disc ? `Descuento (${cart.coupon().code}): −${money(disc)}` : null,
      `Delivery: ${del ? money(del) : 'Gratis'}`,
      `*Total: ${money(cart.total(zone))}*`,
      `Forma de pago: ${co.pago}`,
      '',
      '*Datos de entrega*',
      `Cliente: ${d.nombre} (${d.celular})`,
      `Recibe: ${d.destinatario}`,
      `Dirección: ${d.direccion || 'Recojo en tienda'}`,
      `Zona: ${zoneOf().label}`,
      `Fecha: ${longDate(d.fecha)}, ${d.horario}`,
      d.dedicatoria ? `Dedicatoria: "${d.dedicatoria}"` : null
    ].filter(line => line !== null);
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg.join('\n'))}`;
  }

  function renderSummary() {
    const lines = cart.lines();
    if (!lines.length) { $('#coAside').innerHTML = ''; return; }
    const c = cart.coupon(), disc = cart.discount(), del = cart.delivery(zone);
    const action = co.step === 1
      ? '<button class="btn btn--primary btn--block" data-co="next">Continuar con la entrega</button>'
      : co.step === 2
        ? '<button class="btn btn--primary btn--block" type="submit" form="coForm">Continuar al pago</button>'
        : '<p class="co-sum__hint">Finaliza tu compra con el botón de WhatsApp</p>';
    $('#coAside').innerHTML = `
      <div class="co-sum">
        <h2>Resumen del pedido</h2>
        <div class="co-sum__items">${lines.map(l => `
          <div class="co-sum__item">
            <div class="co-sum__thumb"><img src="${IMG(l.product.img, 120)}" alt=""><span>${l.qty}</span></div>
            <p>${esc(l.product.name)}</p><span>${money(l.total)}</span>
          </div>`).join('')}
        </div>
        ${c ? `<div class="coupon coupon--on"><span>🏷️ ${c.code} · ${c.label}</span><button data-co="uncoupon">Quitar</button></div>`
            : `<form class="coupon" id="couponForm"><input name="code" placeholder="Código de descuento" aria-label="Código de descuento"><button class="btn btn--light">Aplicar</button></form>`}
        <dl class="totals">
          <div><dt>Subtotal</dt><dd>${money(cart.subtotal())}</dd></div>
          ${disc ? `<div class="discount"><dt>Descuento</dt><dd>− ${money(disc)}</dd></div>` : ''}
          <div><dt>Delivery</dt><dd>${del ? money(del) : 'Gratis'}</dd></div>
          <div class="totals__grand"><dt>Total</dt><dd>${money(cart.total(zone))}</dd></div>
        </dl>
        ${action}
        <ul class="co-trust">
          <li>🚚 Entrega el mismo día pidiendo antes de las 4:00 p. m.</li>
          <li>🌷 Garantía de frescura de 5 días</li>
          <li>💬 Atención personalizada por WhatsApp</li>
        </ul>
      </div>`;
    const wa = $('#waBtn');
    if (wa) wa.href = waLink();
  }

  function showDone() {
    const href = $('#waBtn').href, order = co.order, total = cart.total(zone), name = co.data.nombre.split(' ')[0];
    co.step = 'done';
    $$('#steps li').forEach(li => { li.classList.remove('active'); li.classList.add('done'); });
    $('#checkout').classList.add('co--done');
    $('#coMain').innerHTML = `
      <div class="success">
        <div class="success__icon">${ICON_CHECK}</div>
        <h2>¡Gracias, ${esc(name)}!</h2>
        <p>Tu pedido <strong>${order}</strong> por <strong>${money(total)}</strong> se envió a nuestro WhatsApp.</p>
        <p>Un asesor te responderá en minutos con los datos de pago y la confirmación de entrega.</p>
        <a class="btn btn--wa" href="${href}" target="_blank" rel="noopener">${ICON_WA} Abrir WhatsApp otra vez</a>
        <button class="link-btn" data-co="close">Volver a la tienda</button>
      </div>`;
    co.order = null;
    co.data = {};
    cart.clear();
  }

  function initCheckout() {
    const el = $('#checkout');
    el.addEventListener('click', e => {
      const stepLi = e.target.closest('#steps li.done');
      if (stepLi && co.step !== 'done') return goStep(+stepLi.dataset.step);
      const t = e.target.closest('button, a'); if (!t) return;
      if (lineAction(t)) return;
      if (t.id === 'waBtn') { setTimeout(showDone, 400); return; }
      const a = t.dataset.co;
      if (a === 'close') closeCheckout();
      if (a === 'next') goStep(2);
      if (a === 'back') goStep(co.step - 1);
      if (a === 'clear' && confirm('¿Vaciar el carrito?')) cart.clear();
      if (a === 'uncoupon') cart.removeCoupon();
    });
    el.addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      if (f.id === 'couponForm') {
        const ok = cart.applyCoupon(f.code.value);
        toast(ok ? '🏷️ Cupón aplicado' : 'Ese código no es válido');
        if (!ok) f.code.select();
      }
      if (f.id === 'coForm') {
        const invalid = $$('input[required]', f).find(i => !i.checkValidity());
        if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
        co.data = Object.fromEntries(new FormData(f));
        goStep(3);
      }
    });
    el.addEventListener('input', e => {
      if (e.target.form?.id === 'coForm') co.data[e.target.name] = e.target.value;
    });
    el.addEventListener('change', e => {
      const t = e.target;
      if (t.id === 'coZone') {
        zone = t.value;
        const addr = $('#coAddress'), pickup = zone === 'recojo';
        addr.disabled = pickup; addr.required = !pickup;
        addr.placeholder = pickup ? 'Recojo en Av. José Larco 845, Miraflores' : 'Calle, número, distrito y referencia';
        if (pickup) { addr.value = ''; delete co.data.direccion; }
        renderSummary(); renderCart();
      }
      if (t.name === 'pago') {
        co.pago = t.value;
        $$('.co-pay label').forEach(l => l.classList.toggle('selected', l.contains(t)));
        $('#waPay').textContent = co.pago;
        $('#waBtn').href = waLink();
      }
    });
    if (location.hash === '#carrito') {
      history.replaceState(null, '', location.pathname);
      openCheckout(1);
    }
  }

  /* ---------- Extras de UI ---------- */
  function initUI() {
    $('#year').textContent = new Date().getFullYear();
    const header = $('#header');
    addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });

    const nav = $('#nav'), menuBtn = $('#menuBtn');
    menuBtn.onclick = () => { const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); };
    nav.onclick = e => { if (e.target.matches('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } };

    // Enlace activo según la sección visible
    const links = $$('.nav a');
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(s => spy.observe(s));

    // Animación de aparición y contadores
    $$('.about__media, .about__text, .section__head, .testimonials blockquote, .contact__grid > *').forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible');
      $$('[data-count]', en.target).forEach(countUp);
      io.unobserve(en.target);
    }), { threshold: .15 });
    $$('.reveal').forEach(el => io.observe(el));

    $('#newsletter').onsubmit = e => { e.preventDefault(); e.target.reset(); toast('💌 ¡Listo! Te avisaremos de nuestras ofertas.'); };
  }

  function countUp(el) {
    const target = +el.dataset.count, dec = +(el.dataset.decimals || 0), t0 = performance.now();
    const step = now => {
      const k = Math.min((now - t0) / 1600, 1), v = target * (1 - Math.pow(1 - k, 3));
      el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('es-PE') + (k === 1 && target > 1000 ? '+' : '');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  initHero();
  renderOccasions();
  initCatalog();
  initCart();
  initCheckout();
  initUI();
})();
