# Test Suite for n8n Kavenegar Node

This directory contains comprehensive tests for the n8n Kavenegar SMS node.

## Test Structure

### Test Files

- **`kavenegarSMS.node.test.ts`** - Main functionality tests
  - Node description and properties validation
  - Basic SMS sending functionality
  - Credential handling
  - API response handling

- **`kavenegarSMS.validation.test.ts`** - Parameter validation tests
  - Cell number format validation
  - Message text handling (Persian, English, special characters)
  - Pattern validation
  - Edge cases for empty values

- **`kavenegarSMS.error.test.ts`** - Error handling tests
  - Credential errors
  - API response errors (various status codes)
  - Network errors (timeout, connection, DNS)
  - Malformed responses
  - Parameter edge cases

### Utilities

- **`utils/mocks.ts`** - Mock utilities and test data
  - Mock credentials
  - Mock API responses
  - Mock context and helpers
  - Utility functions for test setup

- **`setup.ts`** - Global test configuration
  - n8n-workflow module mocking
  - Console output suppression
  - Global test timeout settings

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
# Run only basic functionality tests
npx jest kavenegarSMS.node.test.ts

# Run only validation tests
npx jest kavenegarSMS.validation.test.ts

# Run only error handling tests
npx jest kavenegarSMS.error.test.ts
```

## Test Coverage

The test suite covers:

### ✅ Node Configuration
- Display name, description, and metadata
- Input/output configuration
- Credential requirements
- Operation parameters

### ✅ SMS Functionality
- Successful SMS sending
- API request formatting
- Response handling
- Parameter mapping

### ✅ Error Scenarios
- Missing credentials
- Invalid API responses
- Network failures
- Malformed data

### ✅ Parameter Validation
- Iranian mobile number formats
- Persian and English text
- Special characters and emojis
- Pattern codes
- Empty values

### ✅ Edge Cases
- Very long messages
- Special characters in phone numbers
- Various API error status codes
- Connection timeouts

## Mock Data

The tests use realistic mock data:

- **API Key**: `test-api-key-123456`
- **Phone Number**: `09123456789` (Iranian format)
- **Message**: `تست پیامک` (Persian test message)
- **Pattern**: `test-pattern`

## Configuration

### Jest Configuration (`jest.config.js`)
- TypeScript support via ts-jest
- Test file patterns
- Coverage reporting
- Setup files

### TypeScript Configuration
Tests use the same TypeScript configuration as the main project (`tsconfig.json`).

## Best Practices

1. **Isolation**: Each test is isolated with `beforeEach` setup
2. **Mocking**: All external dependencies are mocked
3. **Coverage**: Comprehensive test coverage for all code paths
4. **Realistic Data**: Tests use realistic Iranian phone numbers and Persian text
5. **Error Handling**: Extensive error scenario testing

## Adding New Tests

When adding new functionality to the Kavenegar node:

1. Add corresponding tests to the appropriate test file
2. Update mock data if needed
3. Ensure new code paths are covered
4. Run tests to verify everything passes

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **TypeScript Errors**: Check that types are properly imported
3. **Mock Issues**: Verify mocks are reset between tests
4. **Coverage Issues**: Check that all code paths are tested

### Debug Mode

To debug tests:

```bash
# Run with verbose output
npx jest --verbose

# Run specific test with debug info
npx jest --verbose kavenegarSMS.node.test.ts
```