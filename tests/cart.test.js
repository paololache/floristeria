// Prueba del carrito con los 20 productos del catálogo: node tests/cart.test.js
const assert = require('assert');
const { PRODUCTS } = require('../js/products.js');
const { createCart, FREE_DELIVERY_FROM } = require('../js/cart.js');

const mem = () => { const s = {}; return { getItem: k => s[k] ?? null, setItem: (k, v) => { s[k] = v; } }; };

assert.strictEqual(PRODUCTS.length, 20, 'Debe haber 20 productos');
assert.strictEqual(new Set(PRODUCTS.map(p => p.id)).size, 20, 'IDs únicos');

const storage = mem();
const cart = createCart(PRODUCTS, storage);
PRODUCTS.forEach(p => cart.add(p.id));
assert.strictEqual(cart.count(), 20);
const sum = PRODUCTS.reduce((a, p) => a + p.price, 0);
assert.strictEqual(cart.subtotal(), sum);
assert.strictEqual(cart.delivery('lima-ext'), 0, 'Delivery gratis sobre el mínimo');

cart.setQty(1, 3);
assert.strictEqual(cart.count(), 22);
cart.setQty(1, 0);
assert.strictEqual(cart.lines().some(l => l.product.id === 1), false, 'qty 0 elimina');
cart.remove(2);
assert.strictEqual(cart.count(), 18);

// Persistencia
const reloaded = createCart(PRODUCTS, storage);
assert.strictEqual(reloaded.count(), 18);

cart.clear();
assert.strictEqual(cart.count(), 0);
assert.strictEqual(cart.total('lima-ext'), 0, 'Carrito vacío no cobra delivery');

cart.add(12); // S/ 45
assert.strictEqual(cart.delivery('lima-top'), 10);
assert.strictEqual(cart.total('lima-ext'), 70);
assert.strictEqual(cart.delivery('recojo'), 0);
assert.ok(45 < FREE_DELIVERY_FROM);

// Cupones
cart.clear();
assert.strictEqual(cart.applyCoupon('falso'), false, 'Cupón inválido');
cart.add(1, 2); // S/ 258
assert.strictEqual(cart.applyCoupon(' amancay10 '), true);
assert.strictEqual(cart.discount(), 25.8);
assert.strictEqual(cart.delivery('lima-ext'), 25, 'Con descuento baja de S/ 250 y se cobra delivery');
assert.strictEqual(cart.total('lima-ext'), 258 - 25.8 + 25);
assert.strictEqual(createCart(PRODUCTS, storage).coupon().code, 'AMANCAY10', 'Cupón persiste');
cart.applyCoupon('BIENVENIDA');
assert.strictEqual(cart.discount(), 15);
cart.removeCoupon();
assert.strictEqual(cart.discount(), 0);
cart.applyCoupon('BIENVENIDA');
cart.clear();
assert.strictEqual(cart.coupon(), null, 'Vaciar quita el cupón');

console.log(`✓ Carrito OK con ${PRODUCTS.length} productos · subtotal de 1 c/u: S/ ${sum}`);
