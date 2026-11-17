(() => {
  'use strict';
  const PRODUCT = { id: 'oli-house-oil', name: 'OLI Olive Oil', price: 500 };
  const SHIPPING_FEE = 50;
  const CART_KEY = 'oli-cart-v1';
  const ORDER_KEY = 'oli-cod-orders-v1';
  const $ = (selector) => document.querySelector(selector);
  const cartDrawer = $('#cartDrawer');
  const checkoutPanel = $('#checkoutPanel');
  const confirmationPanel = $('#confirmationPanel');
  const overlay = $('#overlay');
  const menu = $('#mobileMenu');
  const formatter = new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 });
  let toastTimer;
  let cart = loadCart();

  function loadCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(stored) ? stored.filter((line) => line.id === PRODUCT.id && Number.isInteger(line.quantity) && line.quantity > 0) : [];
    } catch { return []; }
  }

  function money(amount) { return `EGP ${formatter.format(amount)}`; }
  function quantity() { return cart.reduce((sum, line) => sum + line.quantity, 0); }
  function subtotal() { return cart.reduce((sum, line) => sum + PRODUCT.price * line.quantity, 0); }
  function checkoutTotal() { return subtotal() + SHIPPING_FEE; }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    catch { announce('Your browser could not save the bag on this device.'); }
    renderCart();
  }

  function renderCart() {
    const count = quantity();
    $('#cartCount').textContent = String(count);
    $('#drawerCount').textContent = `(${count})`;
    $('#subtotal').textContent = money(subtotal());
    $('#drawerBottom').hidden = count === 0;
    const content = $('#cartContent');
    if (!count) {
      content.innerHTML = `<div class="empty-cart"><span>OLI</span><h3>Your cart is taking a pause.</h3><p>There’s nothing here just yet.</p><button class="button button-dark" data-action="shop">Discover the oil <span>↗</span></button></div>`;
    } else {
      content.innerHTML = `<div class="cart-line"><div class="mini-bottle"><img class="cart-product-thumb" src="oli-product-still-life.png" alt="OLI Gypt olive oil bottle with olives and olive branches"/></div><div class="cart-line-info"><h3>${PRODUCT.name}</h3><p>OLI / HOUSE BOTTLE</p><span class="cart-line-price">${money(PRODUCT.price * count)}</span><div class="line-controls"><button data-action="minus" aria-label="Decrease quantity">−</button><span>${count}</span><button data-action="plus" aria-label="Increase quantity">+</button></div></div><button class="remove-line" data-action="remove" aria-label="Remove OLI Olive Oil">×</button></div>`;
    }
  }

  function updateOverlay() {
    const active = cartDrawer.classList.contains('open') || checkoutPanel.classList.contains('open') || confirmationPanel.classList.contains('open') || menu.classList.contains('open');
    overlay.classList.toggle('active', active);
    document.body.classList.toggle('locked', active);
  }

  function closePanels() {
    [cartDrawer, checkoutPanel, confirmationPanel].forEach((panel) => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    });
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    updateOverlay();
  }

  function openPanel(panel) {
    closePanels();
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    updateOverlay();
  }

  function announce(message = 'Added to your cart') {
    const toast = $('#toast');
    toast.firstChild.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function addToCart(amount = 1) {
    const line = cart.find((item) => item.id === PRODUCT.id);
    if (line) line.quantity += amount;
    else cart.push({ id: PRODUCT.id, quantity: amount });
    saveCart();
    announce();
  }

  function renderCheckoutSummary() {
    $('#checkoutItems').innerHTML = cart.map((line) => `<div class="checkout-item"><span>${PRODUCT.name} × ${line.quantity}</span><span>${money(PRODUCT.price * line.quantity)}</span></div>`).join('');
    $('#checkoutItems').innerHTML += `<div class="checkout-cost-row"><span>Subtotal</span><span>${money(subtotal())}</span></div><div class="checkout-cost-row"><span>Shipping</span><span>${money(SHIPPING_FEE)}</span></div>`;
    $('#checkoutTotal').textContent = money(checkoutTotal());
  }

  $('#cartOpen').addEventListener('click', () => openPanel(cartDrawer));
  $('#cartClose').addEventListener('click', closePanels);
  $('#checkoutClose').addEventListener('click', closePanels);
  overlay.addEventListener('click', closePanels);
  $('#addFeature').addEventListener('click', () => addToCart());
  $('#addDetail').addEventListener('click', () => {
    const input = $('#productQty');
    const amount = Math.max(1, Math.min(99, Number.parseInt(input.value, 10) || 1));
    input.value = String(amount);
    addToCart(amount);
  });
  $('#qtyMinus').addEventListener('click', () => { $('#productQty').value = String(Math.max(1, (Number.parseInt($('#productQty').value, 10) || 1) - 1)); });
  $('#qtyPlus').addEventListener('click', () => { $('#productQty').value = String(Math.min(99, (Number.parseInt($('#productQty').value, 10) || 1) + 1)); });
  $('#productQty').addEventListener('change', (event) => { event.currentTarget.value = String(Math.max(1, Math.min(99, Number.parseInt(event.currentTarget.value, 10) || 1))); });

  $('#cartContent').addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'shop') { closePanels(); $('#product-detail').scrollIntoView({ behavior: 'smooth' }); return; }
    const line = cart.find((item) => item.id === PRODUCT.id);
    if (!line) return;
    if (action === 'plus') line.quantity = Math.min(99, line.quantity + 1);
    if (action === 'minus') line.quantity -= 1;
    if (action === 'remove' || line.quantity <= 0) cart = [];
    saveCart();
  });

  $('#checkoutOpen').addEventListener('click', () => {
    if (!cart.length) return;
    renderCheckoutSummary();
    openPanel(checkoutPanel);
  });
  $('#backToBag').addEventListener('click', () => openPanel(cartDrawer));
  $('#checkoutForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cart.length || !event.currentTarget.reportValidity()) return;
    const formData = new FormData(event.currentTarget);
    const order = {
      reference: `OLI-${Date.now().toString(36).toUpperCase()}`,
      customer: Object.fromEntries(formData.entries()),
      items: cart.map((line) => ({ ...line, unitPrice: PRODUCT.price })),
      subtotal: subtotal(),
      shippingFee: SHIPPING_FEE,
      total: checkoutTotal(),
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString()
    };
    try {
      const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
      localStorage.setItem(ORDER_KEY, JSON.stringify([order, ...(Array.isArray(orders) ? orders : [])]));
    } catch {
      announce('Unable to save the order on this device. Please try again.');
      return;
    }
    $('#orderReference').textContent = order.reference;
    cart = [];
    saveCart();
    event.currentTarget.reset();
    openPanel(confirmationPanel);
  });
  $('#continueShopping').addEventListener('click', () => { closePanels(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#menuOpen').addEventListener('click', () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); updateOverlay(); });
  $('#menuClose').addEventListener('click', closePanels);
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closePanels));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePanels(); });

  renderCart();
})();
