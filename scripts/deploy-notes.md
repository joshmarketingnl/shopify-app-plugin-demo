# Deployment notes (Hostinger VPS)

1. Clone + install  
   ```bash
   git clone https://github.com/joshmarketingnl/shopify-app-plugin-demo.git
   cd shopify-app-plugin-demo
   npm install
   ```

2. Env vars (`.env`)  
   ```env
   PORT=3000
   OPENAI_API_KEY=your-key
   HOST_BASE_URL=https://your-public-domain
   ```

3. Run with pm2 (optional)  
   ```bash
   pm2 start server/index.js --name shopify-assistant
   pm2 save
   ```

4. Update/restart  
   ```bash
   git pull origin main
   pm2 restart shopify-assistant
   pm2 logs shopify-assistant --lines 100
   ```
