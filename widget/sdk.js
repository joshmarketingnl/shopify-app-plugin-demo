(function () {
  const state = {
    isOpen: false,
    shopPublicId: null,
    shopDomain: '',
    hostBase: '',
    sessionId: null,
    messages: [],
    capabilities: {
      canModifyCart: true,
      showProductImages: true,
      enableQuantityButtons: true,
    },
    branding: {
      primaryColor: '#0c6dfd',
      accentColor: '#f97316',
    },
    cartLines: {},
    productQuantities: {},
  };

  const els = {};

  function ensureStyles() {
    if (document.getElementById('ssc-style')) return;
    const link = document.createElement('link');
    link.id = 'ssc-style';
    link.rel = 'stylesheet';
    link.href = `${state.hostBase}/widget/widget.css`;
    document.head.appendChild(link);
  }

  function applyBranding() {
    const root = document.documentElement;
    if (state.branding.primaryColor) {
      root.style.setProperty('--ssc-primary', state.branding.primaryColor);
    }
    if (state.branding.accentColor) {
      root.style.setProperty('--ssc-accent', state.branding.accentColor);
    }
  }

  function randomId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return `ssc_${Math.random().toString(16).slice(2)}`;
  }

  function deriveHostBase(config) {
    if (config.hostBase) return config.hostBase;
    const current = document.currentScript;
    if (current && current.src) return new URL(current.src).origin;
    const script = document.querySelector('script[src*="/widget/sdk.js"]');
    if (script) return new URL(script.src).origin;
    return window.location.origin;
  }

  function setPanelVisibility(show) {
    state.isOpen = show;
    if (els.panel) {
      els.panel.classList.toggle('ssc-open', show);
    }
  }

  function scrollMessagesToBottom() {
    if (els.messages) {
      els.messages.scrollTop = els.messages.scrollHeight;
    }
  }

  function renderTextBlock(block) {
    const bubble = document.createElement('div');
    bubble.className = `ssc-bubble ${block.role === 'user' ? 'ssc-bubble-user' : 'ssc-bubble-assistant'}`;
    bubble.textContent = block.content;
    return bubble;
  }

  function handleQuantityChange(variantId, delta) {
    const current = state.productQuantities[variantId] || 1;
    const next = Math.max(1, current + delta);
    state.productQuantities[variantId] = next;
    const qtyLabel = document.querySelector(`[data-variant="${variantId}"] .ssc-qty-value`);
    if (qtyLabel) qtyLabel.textContent = next;

    if (!state.capabilities.canModifyCart) return;
    const lineInfo = state.cartLines[variantId];
    if (lineInfo) {
      const identifier = lineInfo.key || variantId;
      changeCartLine(identifier, next)
        .then(() => {
          state.cartLines[variantId].quantity = next;
        })
        .catch(() => showToast('Could not update cart line'));
    }
  }

  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'ssc-product-card';
    card.dataset.variant = product.variantId;

    const qty = state.productQuantities[product.variantId] || product.defaultQty || 1;
    state.productQuantities[product.variantId] = qty;

    const imageHtml =
      state.capabilities.showProductImages && product.imageUrl
        ? `<div class="ssc-product-img"><img src="${product.imageUrl}" alt="${product.title}"/></div>`
        : '';

    const qtyControls = state.capabilities.enableQuantityButtons
      ? `<div class="ssc-qty">
            <button type="button" class="ssc-qty-btn" data-action="dec">-</button>
            <span class="ssc-qty-value">${qty}</span>
            <button type="button" class="ssc-qty-btn" data-action="inc">+</button>
          </div>`
      : `<div class="ssc-qty"><span class="ssc-qty-value">${qty}</span></div>`;

    const disableCart = !state.capabilities.canModifyCart;

    card.innerHTML = `
      ${imageHtml}
      <div class="ssc-product-info">
        <div class="ssc-product-title">${product.title}</div>
        <div class="ssc-product-price">${product.priceFormatted || ''}</div>
        ${qtyControls}
        <div class="ssc-product-actions">
          <button type="button" class="ssc-add-btn" ${disableCart ? 'disabled' : ''}>Add to cart</button>
        </div>
      </div>
    `;

    if (state.capabilities.enableQuantityButtons) {
      const dec = card.querySelector('[data-action="dec"]');
      const inc = card.querySelector('[data-action="inc"]');
      dec?.addEventListener('click', () => handleQuantityChange(product.variantId, -1));
      inc?.addEventListener('click', () => handleQuantityChange(product.variantId, 1));
    }

    const addBtn = card.querySelector('.ssc-add-btn');
    addBtn?.addEventListener('click', async () => {
      const quantity = state.productQuantities[product.variantId] || 1;
      try {
        await addToCart(product.variantId, quantity);
        showToast('Added to cart');
      } catch (err) {
        showToast('Could not add to cart');
        // eslint-disable-next-line no-console
        console.error(err);
      }
    });

    return card;
  }

  function renderProductList(block) {
    const wrap = document.createElement('div');
    wrap.className = 'ssc-product-list';
    (block.products || []).forEach((product) => {
      wrap.appendChild(createProductCard(product));
    });
    return wrap;
  }

  function renderBlock(block) {
    if (block.type === 'product_list') {
      return renderProductList(block);
    }
    return renderTextBlock(block);
  }

  function renderMessages(blocks = []) {
    if (!els.messages) return;
    els.messages.innerHTML = '';
    blocks.forEach((block) => {
      els.messages.appendChild(renderBlock(block));
    });
    scrollMessagesToBottom();
  }

  function appendBlocks(blocks) {
    state.messages.push(...blocks);
    renderMessages(state.messages);
  }

  async function addToCart(variantId, quantity) {
    if (!state.capabilities.canModifyCart) return null;
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ items: [{ id: variantId, quantity }] }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [data];
    const added = items.find((item) => `${item.variant_id}` === `${variantId}`);
    if (added) {
      state.cartLines[variantId] = { key: added.key, quantity: added.quantity };
      state.productQuantities[variantId] = added.quantity;
    }
    return data;
  }

  async function changeCartLine(lineItemKeyOrVariantId, quantity) {
    if (!state.capabilities.canModifyCart) return null;
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        id: lineItemKeyOrVariantId,
        quantity,
      }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    return data;
  }

  async function sendMessage(text) {
    const payload = {
      message: text,
      shopPublicId: state.shopPublicId,
      sessionId: state.sessionId,
    };
    const res = await fetch(`${state.hostBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  }

  function showTyping() {
    state.messages.push({ type: 'text', role: 'assistant', content: '…' });
    renderMessages(state.messages);
  }

  function hideTyping() {
    state.messages = state.messages.filter((b) => b.content !== '…');
    renderMessages(state.messages);
  }

  async function handleSend() {
    const input = els.input;
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    state.messages.push({ type: 'text', role: 'user', content: text });
    renderMessages(state.messages);

    showTyping();
    try {
      const data = await sendMessage(text);
      hideTyping();
      appendBlocks(data.blocks || []);
    } catch (err) {
      hideTyping();
      showToast('Chat request failed');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  function showToast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add('ssc-toast-visible');
    setTimeout(() => els.toast.classList.remove('ssc-toast-visible'), 2000);
  }

  function createUI() {
    if (els.toggle) return;

    const toggle = document.createElement('button');
    toggle.id = 'smartscale-chat-toggle';
    toggle.className = 'ssc-toggle';
    toggle.textContent = 'Chat';

    const panel = document.createElement('div');
    panel.id = 'smartscale-chat-panel';
    panel.className = 'ssc-panel';
    panel.innerHTML = `
      <header class="ssc-panel-header">
        <div>
          <div class="ssc-panel-title">Shopping Assistant</div>
          <div class="ssc-panel-subtitle">Ask about products, shipping, and more.</div>
        </div>
        <button id="ssc-close" aria-label="Close chat" class="ssc-icon-btn">×</button>
      </header>
      <div class="ssc-messages" id="ssc-messages"></div>
      <div class="ssc-input">
        <input id="ssc-input" type="text" placeholder="Ask for recommendations..." />
        <button id="ssc-send" class="ssc-send-btn">Send</button>
      </div>
      <div class="ssc-footer">
        <button id="ssc-checkout" class="ssc-secondary-btn">Checkout</button>
      </div>
      <div id="ssc-toast" class="ssc-toast"></div>
    `;

    toggle.addEventListener('click', () => SmartScaleChat.open());
    panel.querySelector('#ssc-close').addEventListener('click', () => SmartScaleChat.close());
    panel.querySelector('#ssc-send').addEventListener('click', handleSend);
    panel.querySelector('#ssc-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
    panel.querySelector('#ssc-checkout').addEventListener('click', () => {
      window.location.href = '/checkout';
    });

    els.toggle = toggle;
    els.panel = panel;
    els.messages = panel.querySelector('#ssc-messages');
    els.input = panel.querySelector('#ssc-input');
    els.toast = panel.querySelector('#ssc-toast');

    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  }

  async function fetchShopConfig() {
    try {
      const res = await fetch(`${state.hostBase}/api/public/shop-config/${state.shopPublicId}`);
      if (!res.ok) throw new Error('config not found');
      const data = await res.json();
      state.branding = { ...state.branding, ...(data.config.branding || {}) };
      state.capabilities = { ...state.capabilities, ...(data.config.capabilities || {}) };
      state.shopDomain = state.shopDomain || data.config.integration.shopDomain || '';
      applyBranding();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Using default widget styling/capabilities', err);
      applyBranding();
    }
  }

  const SmartScaleChat = {
    init(config) {
      if (!config || !config.shopPublicId) {
        throw new Error('SmartScaleChat.init requires shopPublicId');
      }
      state.shopPublicId = config.shopPublicId;
      state.shopDomain = config.shopDomain || '';
      state.sessionId = randomId();
      state.hostBase = deriveHostBase(config);
      ensureStyles();
      createUI();
      fetchShopConfig();
    },
    open() {
      setPanelVisibility(true);
      els.input?.focus();
    },
    close() {
      setPanelVisibility(false);
    },
  };

  window.SmartScaleChat = SmartScaleChat;
})();
