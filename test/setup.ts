// Global test setup for n8n node testing

// Mock n8n-workflow module
jest.mock('n8n-workflow', () => ({
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, error: string | Error) {
      super(typeof error === 'string' ? error : error.message);
      this.name = 'NodeOperationError';
    }
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Suppress console.log during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});