// Mock utilities for testing n8n Kavenegar node

export const mockCredentials = {
  apiKey: 'test-api-key-123456',
};

export const mockContext = {
  getCredentials: jest.fn().mockReturnValue(mockCredentials),
  helpers: {
    request: jest.fn(),
  },
};

export const mockSuccessfulApiResponse = {
  return: {
    status: 200,
    message: 'تایید شد',
  },
  entries: [
    {
      messageid: 8792343,
      message: 'تست پیامک',
      status: 1,
      statustext: 'در صف ارسال',
      sender: '10004346',
      receptor: '09123456789',
      date: 1234567890,
      cost: 120,
    },
  ],
};

export const mockFailedApiResponse = {
  return: {
    status: 400,
    message: 'خطا در ارسال',
  },
  entries: [],
};

export const mockOperationParameters = {
  cell: '09123456789',
  text: 'تست پیامک',
  pattern: 'test-pattern',
};

export const resetMocks = () => {
  jest.clearAllMocks();
  mockContext.getCredentials.mockReturnValue(mockCredentials);
};

export const mockRequestSuccess = () => {
  mockContext.helpers.request.mockResolvedValue([mockSuccessfulApiResponse]);
};

export const mockRequestFailure = () => {
  mockContext.helpers.request.mockResolvedValue([mockFailedApiResponse]);
};

export const mockRequestError = (error: Error) => {
  mockContext.helpers.request.mockRejectedValue(error);
};

export const mockNoCredentials = () => {
  mockContext.getCredentials.mockReturnValue(undefined);
};