const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const storageRoutes = require('./routes/storage');

// CORS headers for Module Federation
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount storage routes
app.use('/api/storage', storageRoutes);

// Serve the built dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'quotes' });
});

// Catch all - serve index.html (MUST BE LAST!)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Quotes module server running on port ${PORT}`);
  console.log(`Storage API available at http://localhost:${PORT}/api/storage`);
});
