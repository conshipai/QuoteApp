const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Serve the src directory
app.use('/src', express.static(path.join(__dirname, 'src')));

// Create a simple module federation endpoint
app.get('/remoteEntry.js', (req, res) => {
  res.type('application/javascript');
  res.send(`
    // Simple Module Federation mock
    window.quotes = window.quotes || {};
    window.quotes.get = function(module) {
      if (module === './App') {
        return function() {
          console.log('Loading Quotes Module');
          return fetch('/src/QuotesModule.jsx')
            .then(r => r.text())
            .then(code => {
              console.log('Quotes module loaded');
              return { default: eval(code) };
            });
        };
      }
    };
    window.quotes.init = function() { 
      return Promise.resolve(); 
    };
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', app: 'quotes' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Quotes Module Server Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
