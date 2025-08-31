// This is the main export point for the microapp
export { default as QuotesModule } from './src/QuotesModule';

// Export any shared utilities the shell might need
export * from './src/constants/quoteTypes';

// Optional: Export a configuration object
export const moduleConfig = {
  name: 'Quotes',
  version: '1.0.0',
  routes: [
    '/quotes',
    '/quotes/*'
  ],
  permissions: [
    'quotes.view',
    'quotes.create',
    'quotes.edit'
  ]
};
