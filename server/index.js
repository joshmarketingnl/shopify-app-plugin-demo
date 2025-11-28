const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const healthRouter = require('./routes/health');
const chatRouter = require('./routes/chat');
const adminRouter = require('./routes/admin');
const publicRouter = require('./routes/public');

const app = express();
app.use(express.json());
app.use(cors());

const adminDir = path.join(__dirname, '..', 'admin');
const widgetDir = path.join(__dirname, '..', 'widget');
const testDir = path.join(__dirname, '..', 'test');

app.use('/admin', express.static(adminDir));
app.use('/widget', express.static(widgetDir));
app.use('/test', express.static(testDir));

app.use('/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
