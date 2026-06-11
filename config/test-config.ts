/**
 * Test Configuration for Bank Reconciliation QA Test
 * Contains environment settings, API endpoints, and test data configuration
 */
export interface TestConfig {
  apiBaseUrl: string;
  appBaseUrl: string;
  defaultTimeout: number;
  maxTransactions: number;
  supportedCurrencies: string[];
  supportedBrowsers: string[];
  testDataSeed?: string;
}

export const testConfig: TestConfig = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
  maxTransactions: parseInt(process.env.MAX_TRANSACTIONS || '1000'),
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
  supportedBrowsers: ['chromium'],
  ...(process.env.TEST_DATA_SEED && { testDataSeed: process.env.TEST_DATA_SEED })
};

/**
 * Performance thresholds for testing
 */
export const performanceThresholds = {
  pageLoadTime: 5000,
  apiResponseTime: 2000,
  gridRenderTime: 3000,
  searchResponseTime: 1000
};

/**
 * Test data generation settings
 */
export const dataGenerationConfig = {
  minAmount: 0.01,
  maxAmount: 999999.99,
  amountPrecision: 4,
  dateRangeDays: 90,
  descriptionLength: 50
};

/**
 * UI element selectors for different environments
 */
export const selectors = {
  dataGrid: '[data-testid="transaction-grid"]',
  loadingSpinner: '[data-testid="loading-indicator"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]'
};

/**
 * Get configuration based on environment
 */
export const getEnvironmentConfig = (): TestConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...testConfig,
        defaultTimeout: 60000,
        maxTransactions: 10000
      };
    case 'staging':
      return {
        ...testConfig,
        defaultTimeout: 45000,
        maxTransactions: 5000
      };
    default:
      return testConfig;
  }
};
