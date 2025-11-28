(function () {
  const state = {
    isOpen: false,
    config: {},
  };

  function createUI() {
    if (document.getElementById('smartscale-chat-toggle')) return;

    const toggle = document.createElement('button');
    toggle.id = 'smartscale-chat-toggle';
    toggle.textContent = 'Chat';
    toggle.className = 'ssc-toggle';

    const panel = document.createElement('div');
    panel.id = 'smartscale-chat-panel';
    panel.className = 'ssc-panel';
    panel.innerHTML = `
      <header class="ssc-panel-header">
        <span>Shopping Assistant</span>
        <button id="ssc-close" aria-label="Close chat">×</button>
      </header>
      <div class="ssc-panel-body">
        <p class="ssc-placeholder">Chat UI will arrive in Phase 5.</p>
      </div>
    `;

    toggle.addEventListener('click', SmartScaleChat.open);
    panel.querySelector('#ssc-close').addEventListener('click', SmartScaleChat.close);

    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  }

  const SmartScaleChat = {
    init(config) {
      state.config = config || {};
      createUI();
    },
    open() {
      state.isOpen = true;
      const panel = document.getElementById('smartscale-chat-panel');
      if (panel) panel.classList.add('ssc-open');
    },
    close() {
      state.isOpen = false;
      const panel = document.getElementById('smartscale-chat-panel');
      if (panel) panel.classList.remove('ssc-open');
    },
  };

  window.SmartScaleChat = SmartScaleChat;
})();
