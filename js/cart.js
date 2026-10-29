/* Lógica del carrito, independiente del DOM (testeable con Node) */
const DELIVERY_ZONES = [
  { id: 'recojo', label: 'Recojo en tienda (Miraflores)', cost: 0 },
  { id: 'lima-top', label: 'Miraflores, San Isidro, Barranco, Surquillo', cost: 10 },
  { id: 'lima-centro', label: 'Surco, San Borja, La Molina, Jesús María, Lince', cost: 15 },
  { id: 'lima-ext', label: 'Otros distritos de Lima Metropolitana', cost: 25 }
];
const FREE_DELIVERY_FROM = 250;
const COUPONS = {
  AMANCAY10: { label: '10% de descuento', pct: 10 },
  BIENVENIDA: { label: 'S/ 15 de descuento', amount: 15 }
};

function createCart(products, storage) {
  const KEY = 'amancay-cart', COUPON_KEY = 'amancay-coupon';
  let items = {};
  let couponCode = null;
  try { items = JSON.parse(storage?.getItem(KEY) || '{}') || {}; } catch { items = {}; }
  try { couponCode = COUPONS[storage?.getItem(COUPON_KEY)] ? storage.getItem(COUPON_KEY) : null; } catch { couponCode = null; }
  // Descarta productos que ya no existan en el catálogo
  for (const id of Object.keys(items)) if (!products.some(p => p.id === +id)) delete items[id];

  const listeners = [];
  const save = () => {
    try {
      storage?.setItem(KEY, JSON.stringify(items));
      storage?.setItem(COUPON_KEY, couponCode || '');
    } catch { /* sin almacenamiento */ }
    listeners.forEach(fn => fn());
  };

  return {
    add(id, qty = 1) { items[id] = (items[id] || 0) + qty; save(); },
    setQty(id, qty) { if (qty <= 0) delete items[id]; else items[id] = qty; save(); },
    remove(id) { delete items[id]; save(); },
    clear() { items = {}; couponCode = null; save(); },
    applyCoupon(code) {
      const c = String(code).trim().toUpperCase();
      if (!COUPONS[c]) return false;
      couponCode = c; save(); return true;
    },
    removeCoupon() { couponCode = null; save(); },
    coupon() { return couponCode ? { code: couponCode, ...COUPONS[couponCode] } : null; },
    discount() {
      const c = this.coupon();
      if (!c || !this.count()) return 0;
      const sub = this.subtotal();
      return Math.min(sub, c.pct ? Math.round(sub * c.pct) / 100 : c.amount);
    },
    lines() {
      return Object.entries(items).map(([id, qty]) => {
        const product = products.find(p => p.id === +id);
        return { product, qty, total: product.price * qty };
      });
    },
    count() { return Object.values(items).reduce((a, b) => a + b, 0); },
    subtotal() { return this.lines().reduce((a, l) => a + l.total, 0); },
    delivery(zoneId) {
      const zone = DELIVERY_ZONES.find(z => z.id === zoneId) || DELIVERY_ZONES[0];
      if (!this.count()) return 0;
      return this.subtotal() - this.discount() >= FREE_DELIVERY_FROM ? 0 : zone.cost;
    },
    total(zoneId) { return this.subtotal() - this.discount() + this.delivery(zoneId); },
    onChange(fn) { listeners.push(fn); }
  };
}

if (typeof module !== 'undefined') module.exports = { createCart, DELIVERY_ZONES, FREE_DELIVERY_FROM, COUPONS };
