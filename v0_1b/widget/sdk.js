(function () {
  const state = {
    isOpen: false,
    config: null,
    sessionId: null,
    elements: {},
    sending: false,
  };

  function log(message, data) {
    if (data) {
      console.info(`[SmartScaleChat v0.1b] ${message}`, data);
    } else {
      console.info(`[SmartScaleChat v0.1b] ${message}`);
    }
  }

  function generateSessionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `ssc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function applyTheme() {
    const root = document.documentElement;
    const { primaryColor, accentColor } = state.config || {};
    if (primaryColor) root.style.setProperty('--ssc-accent', primaryColor);
    if (accentColor) root.style.setProperty('--ssc-text-strong', accentColor);
  }

  function ensureElements() {
    if (state.elements.root) return;

    const launcher = createEl('button', 'ssc-launcher', 'Chat');
    launcher.setAttribute('aria-label', 'Open shopping assistant');

    const panel = createEl('div', 'ssc-panel');
    const header = createEl('div', 'ssc-header');
    const titleWrap = createEl('div', 'ssc-header-text');
    titleWrap.appendChild(createEl('div', 'ssc-title', state.config?.title || 'Shopping assistant'));
    titleWrap.appendChild(createEl('div', 'ssc-subtitle', 'Powered by SmartScale v0.1b'));
    const closeBtn = createEl('button', 'ssc-icon-btn');
    closeBtn.innerHTML = '&times;';
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);

    const messages = createEl('div', 'ssc-messages');
    const inputBar = createEl('div', 'ssc-input-bar');
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Ask about products...';
    const sendBtn = createEl('button', 'ssc-send-btn', 'Send');
    inputBar.appendChild(textarea);
    inputBar.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(inputBar);

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    // Positioning
    const pos = state.config?.widgetPosition || 'bottom-right';
    if (pos.includes('left')) {
      launcher.classList.add('ssc-left');
      panel.classList.add('ssc-left');
    }
    if (pos.includes('top')) {
      launcher.classList.add('ssc-top');
      panel.classList.add('ssc-top');
    }

    launcher.addEventListener('click', toggleOpen);
    closeBtn.addEventListener('click', close);
    sendBtn.addEventListener('click', () => handleSend(textarea));
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(textarea);
      }
    });

    state.elements = { launcher, panel, header, messages, textarea, sendBtn };
  }

  function toggleOpen() {
    state.isOpen ? close() : open();
  }

  function open() {
    state.isOpen = true;
    state.elements.panel.classList.add('open');
    state.elements.launcher.classList.add('hidden');
    state.elements.textarea.focus();
  }

  function close() {
    state.isOpen = false;
    state.elements.panel.classList.remove('open');
    state.elements.launcher.classList.remove('hidden');
  }

  function appendMessageBubble({ role = 'assistant', text = '' }) {
    const bubble = createEl('div', `ssc-bubble ${role}`);
    bubble.textContent = text;
    state.elements.messages.appendChild(bubble);
    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  function renderBlocks(blocks = []) {
    blocks.forEach((block) => {
      switch (block.type) {
        case 'text':
          appendMessageBubble({ role: block.role || 'assistant', text: block.text || '' });
          break;
        case 'product_list':
          renderProductList(block);
          break;
        case 'action_buttons':
          renderActionButtons(block);
          break;
        case 'notice':
          appendMessageBubble({ role: 'notice', text: block.text || '' });
          break;
        default:
          appendMessageBubble({ role: 'notice', text: 'Unsupported block type received.' });
      }
    });
  }

  function renderProductList(block) {
    const wrapper = createEl('div', 'ssc-product-list');
    (block.items || []).forEach((item) => {
      const card = createEl('div', 'ssc-product-card');
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || 'Product image';
        card.appendChild(img);
      }
      const title = createEl('div', 'ssc-product-title', item.title || 'Product');
      const subtitle = createEl('div', 'ssc-product-subtitle', item.subtitle || item.description || '');
      const price = createEl('div', 'ssc-product-price', item.price || '');
      card.appendChild(title);
      card.appendChild(subtitle);
      card.appendChild(price);

      const controls = createEl('div', 'ssc-product-controls');
      const qtyWrap = createEl('div', 'ssc-qty');
      const minus = createEl('button', 'ssc-qty-btn', '−');
      const plus = createEl('button', 'ssc-qty-btn', '+');
      const qty = createEl('span', 'ssc-qty-value', String(item.quantity || 1));
      qtyWrap.appendChild(minus);
      qtyWrap.appendChild(qty);
      qtyWrap.appendChild(plus);
      controls.appendChild(qtyWrap);

      const canModify = state.config?.canModifyCart !== false;
      const addBtn = createEl('button', 'ssc-add-btn', canModify ? 'Add to cart' : 'View product');
      if (!canModify) {
        addBtn.disabled = false;
      }

      minus.addEventListener('click', () => {
        const current = Math.max(1, Number(qty.textContent) - 1);
        qty.textContent = String(current);
      });
      plus.addEventListener('click', () => {
        const current = Math.max(1, Number(qty.textContent) + 1);
        qty.textContent = String(current);
      });
      addBtn.addEventListener('click', async () => {
        if (!canModify) {
          if (item.productUrl) window.open(item.productUrl, '_blank');
          return;
        }
        const variantId = item.variantId || item.id;
        if (!variantId) {
          appendMessageBubble({ role: 'notice', text: 'Missing variant id for cart action.' });
          return;
        }
        const quantity = Number(qty.textContent) || 1;
        addBtn.disabled = true;
        addBtn.textContent = 'Adding...';
        try {
          await addToCart(variantId, quantity);
          addBtn.textContent = 'Added';
          setTimeout(() => {
            addBtn.disabled = false;
            addBtn.textContent = 'Add to cart';
          }, 1200);
        } catch (err) {
          console.error(err);
          addBtn.disabled = false;
          addBtn.textContent = 'Add to cart';
          appendMessageBubble({ role: 'notice', text: 'Cart update failed.' });
        }
      });

      controls.appendChild(addBtn);
      card.appendChild(controls);
      wrapper.appendChild(card);
    });
    state.elements.messages.appendChild(wrapper);
    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  function renderActionButtons(block) {
    const bar = createEl('div', 'ssc-action-buttons');
    (block.actions || []).forEach((action) => {
      const btn = createEl('button', 'ssc-chip', action.label || action.type || 'Action');
      btn.addEventListener('click', () => {
        if (action.type === 'checkout') {
          window.location.href = '/checkout';
          return;
        }
        if (action.payload?.message) {
          state.elements.textarea.value = action.payload.message;
          handleSend(state.elements.textarea);
        }
      });
      bar.appendChild(btn);
    });
    state.elements.messages.appendChild(bar);
    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  function setSending(isSending) {
    state.sending = isSending;
    state.elements.sendBtn.disabled = isSending;
    state.elements.textarea.disabled = isSending;
  }

  async function handleSend(textarea) {
    const text = (textarea.value || '').trim();
    if (!text || state.sending) return;
    appendMessageBubble({ role: 'user', text });
    textarea.value = '';
    setSending(true);
    const host = state.config.hostBaseUrl || '';
    const url = `${host}/v0_1b/api/chat`.replace('//v0_1b', '/v0_1b');
    const payload = {
      message: text,
      shopPublicId: state.config.shopPublicId,
      sessionId: state.sessionId,
    };
    let typing;
    try {
      typing = createEl('div', 'ssc-bubble typing', 'Thinking...');
      state.elements.messages.appendChild(typing);
      state.elements.messages.scrollTop = state.elements.messages.scrollHeight;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Chat request failed (${res.status})`);
      }
      const data = await res.json();
      if (!data.blocks || !Array.isArray(data.blocks)) {
        throw new Error('Invalid blocks in response');
      }
      typing.remove();
      renderBlocks(data.blocks);
    } catch (err) {
      console.error(err);
      if (typing?.remove) typing.remove();
      appendMessageBubble({ role: 'notice', text: 'We had trouble responding. Please try again.' });
    } finally {
      setSending(false);
    }
  }

  async function addToCart(variantId, quantity) {
    const body = { items: [{ id: variantId, quantity }] };
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Add to cart failed: ${text}`);
    }
    return res.json();
  }

  const SmartScaleChat = {
    init(config = {}) {
      if (!config.shopPublicId) {
        log('Missing shopPublicId; widget will not initialize.');
        return;
      }
      state.config = {
        widgetPosition: 'bottom-right',
        canModifyCart: true,
        ...config,
      };
      state.sessionId = generateSessionId();
      applyTheme();
      ensureElements();
      log('Widget initialized', { shopPublicId: config.shopPublicId });
    },
    open,
    close,
  };

  window.SmartScaleChat = SmartScaleChat;
})();
