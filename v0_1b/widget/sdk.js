(function () {
  const state = {
    isOpen: false,
    config: null,
  };

  function log(message) {
    console.info(`[SmartScaleChat v0.1b] ${message}`);
  }

  const SmartScaleChat = {
    init(config = {}) {
      if (!config.shopPublicId) {
        log('Missing shopPublicId; widget will not initialize.');
        return;
      }
      state.config = config;
      log('Widget stub initialized. Full chat UI coming soon.');
    },
    open() {
      state.isOpen = true;
      log('open() called (stub)');
    },
    close() {
      state.isOpen = false;
      log('close() called (stub)');
    },
  };

  window.SmartScaleChat = SmartScaleChat;
})();
