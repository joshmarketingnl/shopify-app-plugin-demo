(function () {
  const state = {
    clients: [],
    shops: [],
    selectedClientId: null,
    selectedShop: null,
    shopConfig: null,
  };

  const hostBase = window.location.origin;

  const elements = {
    clientsList: document.getElementById('clientsList'),
    shopsList: document.getElementById('shopsList'),
    clientForm: document.getElementById('clientForm'),
    shopForm: document.getElementById('shopForm'),
    configForm: document.getElementById('configForm'),
    snippet: document.getElementById('snippet'),
    selectedClientLabel: document.getElementById('selectedClientLabel'),
    selectedShopLabel: document.getElementById('selectedShopLabel'),
    toast: document.getElementById('toast'),
    configPlaceholder: document.getElementById('configPlaceholder'),
  };

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Request failed');
    }
    return res.json();
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    setTimeout(() => elements.toast.classList.add('hidden'), 2200);
  }

  function setConfigVisibility(show) {
    if (!elements.configForm || !elements.configPlaceholder) return;
    elements.configForm.classList.toggle('hidden', !show);
    elements.configPlaceholder.classList.toggle('hidden', show);
  }

  function renderClients() {
    const { clientsList } = elements;
    if (!clientsList) return;
    clientsList.innerHTML = '';
    state.clients.forEach((client) => {
      const btn = document.createElement('button');
      btn.textContent = client.name || 'Unnamed client';
      btn.className = state.selectedClientId === client.id ? 'active' : '';
      btn.addEventListener('click', () => selectClient(client.id));
      clientsList.appendChild(btn);
    });
  }

  function renderShops() {
    const { shopsList } = elements;
    if (!shopsList) return;
    shopsList.innerHTML = '';
    state.shops.forEach((shop) => {
      const btn = document.createElement('button');
      btn.textContent = `${shop.publicId} (${shop.shopDomain})`;
      btn.className = state.selectedShop && state.selectedShop.id === shop.id ? 'active' : '';
      btn.addEventListener('click', () => selectShop(shop));
      shopsList.appendChild(btn);
    });
  }

  function populateConfigForm(config) {
    const form = elements.configForm;
    if (!form) return;
    form.baseSystemPrompt.value = config.ai.baseSystemPrompt || '';
    form.extraContext.value = config.ai.extraContext || '';
    form.language.value = config.ai.language || 'en';
    form.tone.value = config.ai.tone || 'friendly';
    form.primaryColor.value = config.branding.primaryColor || '#0c6dfd';
    form.accentColor.value = config.branding.accentColor || '#f97316';
    form.widgetPosition.value = config.branding.widgetPosition || 'bottom-right';
    form.shopDomain.value = config.integration.shopDomain || '';
    form.storefrontToken.value = config.integration.storefrontToken || '';
    form.canModifyCart.checked = Boolean(config.capabilities.canModifyCart);
    form.showProductImages.checked = Boolean(config.capabilities.showProductImages);
    form.enableQuantityButtons.checked = Boolean(config.capabilities.enableQuantityButtons);
  }

  function updateSelectedLabels() {
    const client = state.clients.find((c) => c.id === state.selectedClientId);
    elements.selectedClientLabel.textContent = client ? `Selected: ${client.name}` : 'No client selected';
    elements.selectedShopLabel.textContent = state.selectedShop
      ? `Selected: ${state.selectedShop.publicId}`
      : 'No shop selected';
  }

  function updateSnippet() {
    if (!elements.snippet || !state.selectedShop || !state.shopConfig) return;
    const shopDomain =
      state.shopConfig.integration.shopDomain || state.selectedShop.shopDomain || 'shop-domain.myshopify.com';
    const snippet = `<script src="${hostBase}/widget/sdk.js" defer></script>
<script>
  window.addEventListener('load', function () {
    SmartScaleChat.init({
      shopPublicId: '${state.selectedShop.publicId}',
      shopDomain: '${shopDomain}'
    });
  });
</script>`;
    elements.snippet.value = snippet;
  }

  async function loadClients() {
    try {
      state.clients = await fetchJson('/api/admin/clients');
      renderClients();
      if (state.clients.length && !state.selectedClientId) {
        selectClient(state.clients[0].id);
      }
      updateSelectedLabels();
    } catch (err) {
      showToast('Failed to load clients');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async function selectClient(clientId) {
    state.selectedClientId = clientId;
    state.selectedShop = null;
    state.shopConfig = null;
    renderClients();
    updateSelectedLabels();
    await loadShops(clientId);
  }

  async function loadShops(clientId) {
    try {
      state.shops = await fetchJson(`/api/admin/clients/${clientId}/shops`);
      renderShops();
      if (state.shops.length) {
        selectShop(state.shops[0]);
      } else {
        setConfigVisibility(false);
        elements.snippet.value = '';
      }
    } catch (err) {
      showToast('Failed to load shops');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async function selectShop(shop) {
    state.selectedShop = shop;
    renderShops();
    updateSelectedLabels();
    await loadShopConfig(shop.id);
  }

  async function loadShopConfig(shopId) {
    try {
      const config = await fetchJson(`/api/admin/shops/${shopId}/config`);
      state.shopConfig = config;
      setConfigVisibility(true);
      populateConfigForm(config);
      updateSnippet();
    } catch (err) {
      setConfigVisibility(false);
      showToast('No config found for shop');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async function handleClientSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = {
      name: formData.get('name'),
      contactEmail: formData.get('contactEmail'),
    };
    try {
      await fetchJson('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      event.target.reset();
      showToast('Client created');
      await loadClients();
    } catch (err) {
      showToast('Could not create client');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async function handleShopSubmit(event) {
    event.preventDefault();
    if (!state.selectedClientId) {
      showToast('Select a client first');
      return;
    }
    const formData = new FormData(event.target);
    const payload = {
      shopDomain: formData.get('shopDomain'),
      publicId: formData.get('publicId'),
      status: formData.get('status'),
    };
    try {
      await fetchJson(`/api/admin/clients/${state.selectedClientId}/shops`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      event.target.reset();
      showToast('Shop created');
      await loadShops(state.selectedClientId);
    } catch (err) {
      showToast('Could not create shop');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  function gatherConfigFormData() {
    const form = elements.configForm;
    return {
      ai: {
        baseSystemPrompt: form.baseSystemPrompt.value || '',
        extraContext: form.extraContext.value || '',
        language: form.language.value || 'en',
        tone: form.tone.value || 'friendly',
      },
      branding: {
        primaryColor: form.primaryColor.value || '#0c6dfd',
        accentColor: form.accentColor.value || '#f97316',
        widgetPosition: form.widgetPosition.value || 'bottom-right',
      },
      integration: {
        shopDomain: form.shopDomain.value || '',
        storefrontToken: form.storefrontToken.value || '',
        mcpConfig: null,
      },
      capabilities: {
        canModifyCart: form.canModifyCart.checked,
        showProductImages: form.showProductImages.checked,
        enableQuantityButtons: form.enableQuantityButtons.checked,
      },
    };
  }

  async function handleConfigSubmit(event) {
    event.preventDefault();
    if (!state.selectedShop) {
      showToast('Select a shop first');
      return;
    }
    const payload = gatherConfigFormData();
    try {
      const updated = await fetchJson(`/api/admin/shops/${state.selectedShop.id}/config`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      state.shopConfig = updated;
      showToast('Config saved');
      updateSnippet();
    } catch (err) {
      showToast('Could not save config');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  function bindEvents() {
    elements.clientForm?.addEventListener('submit', handleClientSubmit);
    elements.shopForm?.addEventListener('submit', handleShopSubmit);
    elements.configForm?.addEventListener('submit', handleConfigSubmit);
  }

  function init() {
    bindEvents();
    loadClients();
  }

  init();
})();
