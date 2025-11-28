(() => {
  const state = {
    adminSecret: localStorage.getItem('ssc_admin_secret') || '',
    hostBase: window.location.origin,
    clients: [],
    shops: [],
    currentClientId: null,
    currentShopId: null,
  };

  const els = {
    navLinks: Array.from(document.querySelectorAll('.nav-link')),
    views: Array.from(document.querySelectorAll('.view')),
    statusBadge: document.getElementById('statusBadge'),
    hostBaseInput: document.getElementById('hostBaseInput'),
    adminSecretInput: document.getElementById('adminSecretInput'),
    saveAdminSecret: document.getElementById('saveAdminSecret'),
    clientList: document.getElementById('clientList'),
    clientForm: document.getElementById('clientForm'),
    refreshClients: document.getElementById('refreshClients'),
    shopList: document.getElementById('shopList'),
    shopForm: document.getElementById('shopForm'),
    refreshShops: document.getElementById('refreshShops'),
    shopConfigEmpty: document.getElementById('shopConfigEmpty'),
    shopConfigForm: document.getElementById('shopConfigForm'),
    saveShopConfig: document.getElementById('saveShopConfig'),
    sdkSnippet: document.getElementById('sdkSnippet'),
    iframeSnippet: document.getElementById('iframeSnippet'),
    aiForm: document.getElementById('aiForm'),
    aiKeyStatus: document.getElementById('aiKeyStatus'),
  };

  function setStatus(text, tone = 'info') {
    els.statusBadge.textContent = text;
    els.statusBadge.className = `status-badge ${tone}`;
  }

  function getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (state.adminSecret) {
      headers['x-admin-secret'] = state.adminSecret;
    }
    return headers;
  }

  async function fetchJson(path, options = {}) {
    const res = await fetch(path, {
      ...options,
      headers: { ...getHeaders(), ...(options.headers || {}) },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
  }

  function renderClients() {
    els.clientList.innerHTML = '';
    state.clients.forEach((client) => {
      const pill = document.createElement('button');
      pill.className = `pill ${client.id === state.currentClientId ? 'active' : ''}`;
      pill.textContent = client.name || 'Unnamed client';
      pill.onclick = () => {
        state.currentClientId = client.id;
        renderClients();
        loadShops(client.id);
      };
      els.clientList.appendChild(pill);
    });
  }

  function renderShops() {
    els.shopList.innerHTML = '';
    state.shops.forEach((shop) => {
      const pill = document.createElement('button');
      pill.className = `pill ${shop.id === state.currentShopId ? 'active' : ''}`;
      pill.textContent = shop.name || shop.shopDomain || 'Shop';
      pill.onclick = () => {
        state.currentShopId = shop.id;
        renderShops();
        loadShopConfig(shop.id);
      };
      els.shopList.appendChild(pill);
    });
  }

  function populateShopConfigForm(config = {}) {
    els.shopConfigForm.brandDescription.value = config.brandDescription || '';
    els.shopConfigForm.tone.value = config.tone || '';
    els.shopConfigForm.language.value = config.language || '';
    els.shopConfigForm.baseSystemPrompt.value = config.baseSystemPrompt || '';
    els.shopConfigForm.extraContext.value = config.extraContext || '';
    els.shopConfigForm.primaryColor.value = config.primaryColor || '';
    els.shopConfigForm.accentColor.value = config.accentColor || '';
    els.shopConfigForm.widgetPosition.value = config.widgetPosition || 'bottom-right';
    els.shopConfigForm.canModifyCart.checked = Boolean(config.canModifyCart);
    els.shopConfigForm.showProductImages.checked = Boolean(config.showProductImages);
    els.shopConfigForm.enableQuantityButtons.checked = Boolean(config.enableQuantityButtons);
  }

  function updateSnippets() {
    const shop = state.shops.find((s) => s.id === state.currentShopId);
    if (!shop) {
      els.sdkSnippet.value = '';
      els.iframeSnippet.value = '';
      return;
    }
    const host = state.hostBase || window.location.origin;
    els.sdkSnippet.value = `<script src="${host}/v0_1b/widget/sdk.js" defer></script>
<script>
  window.addEventListener('load', function () {
    SmartScaleChat.init({
      shopPublicId: '${shop.publicId}',
      shopDomain: '${shop.shopDomain}'
    });
  });
</script>`;
    els.iframeSnippet.value = `<iframe src="${host}/v0_1b/test/test-widget.html" style="width:100%;height:600px;border:0;"></iframe>`;
  }

  async function loadClients() {
    setStatus('Loading clients...');
    try {
      const data = await fetchJson('/v0_1b/api/admin/clients');
      state.clients = data.clients || [];
      if (!state.currentClientId && state.clients.length) {
        state.currentClientId = state.clients[0].id;
      }
      renderClients();
      if (state.currentClientId) {
        await loadShops(state.currentClientId);
      } else {
        state.shops = [];
        renderShops();
      }
      setStatus('Clients loaded');
    } catch (err) {
      console.error(err);
      setStatus('Failed to load clients', 'error');
    }
  }

  async function loadShops(clientId) {
    setStatus('Loading shops...');
    try {
      const data = await fetchJson(`/v0_1b/api/admin/clients/${clientId}/shops`);
      state.shops = data.shops || [];
      if (!state.currentShopId && state.shops.length) {
        state.currentShopId = state.shops[0].id;
      }
      renderShops();
      if (state.currentShopId) {
        await loadShopConfig(state.currentShopId);
      } else {
        els.shopConfigForm.classList.add('hidden');
        els.shopConfigEmpty.classList.remove('hidden');
      }
      setStatus('Shops loaded');
    } catch (err) {
      console.error(err);
      setStatus('Failed to load shops', 'error');
    }
  }

  async function loadShopConfig(shopId) {
    setStatus('Loading shop config...');
    try {
      const data = await fetchJson(`/v0_1b/api/admin/shops/${shopId}/config`);
      populateShopConfigForm(data.config || {});
      els.shopConfigForm.classList.remove('hidden');
      els.shopConfigEmpty.classList.add('hidden');
      updateSnippets();
      setStatus('Shop config loaded');
    } catch (err) {
      console.error(err);
      setStatus('Failed to load shop config', 'error');
    }
  }

  async function loadAiSettings() {
    try {
      const data = await fetchJson('/v0_1b/api/admin/settings/ai');
      els.aiForm.debugLogging.checked = Boolean(data.debugLogging);
      els.aiKeyStatus.textContent = data.hasApiKey ? 'Key stored' : 'No key stored';
      els.aiKeyStatus.style.background = data.hasApiKey ? '#dcfce7' : '#fef3c7';
      els.aiKeyStatus.style.color = data.hasApiKey ? '#166534' : '#92400e';
    } catch (err) {
      console.error(err);
      setStatus('Failed to load AI settings', 'error');
    }
  }

  function bindNavigation() {
    els.navLinks.forEach((btn) => {
      btn.addEventListener('click', () => {
        els.navLinks.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        els.views.forEach((v) => v.classList.remove('active'));
        const target = document.getElementById(btn.dataset.target);
        if (target) target.classList.add('active');
      });
    });
  }

  function bindForms() {
    els.saveAdminSecret.addEventListener('click', () => {
      state.adminSecret = els.adminSecretInput.value.trim();
      localStorage.setItem('ssc_admin_secret', state.adminSecret);
      setStatus('Admin secret saved locally');
    });

    els.hostBaseInput.addEventListener('change', () => {
      state.hostBase = els.hostBaseInput.value || window.location.origin;
      updateSnippets();
    });

    els.clientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(els.clientForm);
      try {
        await fetchJson('/v0_1b/api/admin/clients', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.get('name'),
            contactEmail: formData.get('contactEmail'),
          }),
        });
        els.clientForm.reset();
        await loadClients();
      } catch (err) {
        console.error(err);
        setStatus('Failed to add client', 'error');
      }
    });

    els.shopForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!state.currentClientId) {
        setStatus('Select a client first', 'error');
        return;
      }
      const formData = new FormData(els.shopForm);
      try {
        await fetchJson(`/v0_1b/api/admin/clients/${state.currentClientId}/shops`, {
          method: 'POST',
          body: JSON.stringify({
            shopDomain: formData.get('shopDomain'),
            publicId: formData.get('publicId'),
            status: formData.get('status'),
            name: formData.get('name'),
          }),
        });
        els.shopForm.reset();
        await loadShops(state.currentClientId);
      } catch (err) {
        console.error(err);
        setStatus('Failed to add shop', 'error');
      }
    });

    els.refreshClients.addEventListener('click', loadClients);
    els.refreshShops.addEventListener('click', () => {
      if (state.currentClientId) loadShops(state.currentClientId);
    });

    els.saveShopConfig.addEventListener('click', async () => {
      if (!state.currentShopId) {
        setStatus('Select a shop first', 'error');
        return;
      }
      const formData = new FormData(els.shopConfigForm);
      const body = {
        brandDescription: formData.get('brandDescription'),
        tone: formData.get('tone'),
        language: formData.get('language'),
        baseSystemPrompt: formData.get('baseSystemPrompt'),
        extraContext: formData.get('extraContext'),
        primaryColor: formData.get('primaryColor'),
        accentColor: formData.get('accentColor'),
        widgetPosition: formData.get('widgetPosition'),
        canModifyCart: formData.get('canModifyCart') === 'on',
        showProductImages: formData.get('showProductImages') === 'on',
        enableQuantityButtons: formData.get('enableQuantityButtons') === 'on',
      };
      try {
        await fetchJson(`/v0_1b/api/admin/shops/${state.currentShopId}/config`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        setStatus('Shop config saved');
        updateSnippets();
      } catch (err) {
        console.error(err);
        setStatus('Failed to save shop config', 'error');
      }
    });

    els.aiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(els.aiForm);
      try {
        await fetchJson('/v0_1b/api/admin/settings/ai', {
          method: 'PUT',
          body: JSON.stringify({
            apiKey: formData.get('apiKey') || undefined,
            debugLogging: formData.get('debugLogging') === 'on',
          }),
        });
        els.aiForm.apiKey.value = '';
        setStatus('AI settings saved');
        loadAiSettings();
      } catch (err) {
        console.error(err);
        setStatus('Failed to save AI settings', 'error');
      }
    });
  }

  function init() {
    els.hostBaseInput.value = state.hostBase;
    els.adminSecretInput.value = state.adminSecret;
    bindNavigation();
    bindForms();
    loadClients();
    loadAiSettings();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
