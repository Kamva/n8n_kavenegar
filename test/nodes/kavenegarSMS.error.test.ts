import { KavenegarSMS } from '../../nodes/kavenegarSMS/kavenegarSMS.node';
import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

// Mock the execute functions context
const mockExecuteFunctions = {
  getInputData: jest.fn().mockReturnValue([{ json: {} }]),
  getNodeParameter: jest.fn(),
  getCredentials: jest.fn(),
  getNode: jest.fn().mockReturnValue({ name: 'Kavenegar SMS' }),
  continueOnFail: jest.fn().mockReturnValue(false),
  helpers: {
    request: jest.fn(),
  },
} as unknown as IExecuteFunctions;

describe('KavenegarSMS Error Handling', () => {
  let node: KavenegarSMS;

  beforeEach(() => {
    node = new KavenegarSMS();
    jest.clearAllMocks();
  });

  describe('Credential Errors', () => {
    it('should handle undefined credentials', async () => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue(undefined);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        NodeOperationError
      );
      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'No credentials got returned!'
      );
    });

    it('should handle null credentials', async () => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue(null);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        NodeOperationError
      );
      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'No credentials got returned!'
      );
    });

    it('should handle missing API key in credentials', async () => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({});
      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue({
        return: { status: 200 },
      });

      const result = await node.execute.call(mockExecuteFunctions);
      expect(result).toBeDefined();
      expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('undefined'),
        })
      );
    });
  });

  describe('API Response Errors', () => {
    beforeEach(() => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValue('09123456789')
        .mockReturnValue('Test message')
        .mockReturnValue('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({
        apiKey: 'test-api-key',
      });
    });

    it('should handle various API error status codes', async () => {
      const errorStatuses = [
        { status: 400, message: 'Bad Request' },
        { status: 401, message: 'Unauthorized' },
        { status: 403, message: 'Forbidden' },
        { status: 404, message: 'Not Found' },
        { status: 422, message: 'Unprocessable Entity' },
        { status: 500, message: 'Internal Server Error' },
      ];

      for (const errorStatus of errorStatuses) {
        (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue({
          return: {
            status: errorStatus.status,
            message: errorStatus.message,
          },
        });

        await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
          NodeOperationError
        );
        await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
          `Kavenegar API request failed. Response: ${errorStatus.status}`
        );
      }
    });

    it('should handle malformed API response', async () => {
      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue({
        // Missing return property
        entries: [],
      });

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow();
    });

    it('should handle empty API response', async () => {
      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue(null);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow();
    });
  });

  describe('Network Errors', () => {
    beforeEach(() => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValue('09123456789')
        .mockReturnValue('Test message')
        .mockReturnValue('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({
        apiKey: 'test-api-key',
      });
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (mockExecuteFunctions.helpers.request as jest.Mock).mockRejectedValue(timeoutError);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Request timeout');
    });

    it('should handle connection errors', async () => {
      const connectionError = new Error('ECONNREFUSED');
      connectionError.name = 'ConnectionError';
      (mockExecuteFunctions.helpers.request as jest.Mock).mockRejectedValue(connectionError);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('ECONNREFUSED');
    });

    it('should handle DNS resolution errors', async () => {
      const dnsError = new Error('ENOTFOUND api.kavenegar.com');
      dnsError.name = 'DNSError';
      (mockExecuteFunctions.helpers.request as jest.Mock).mockRejectedValue(dnsError);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'ENOTFOUND api.kavenegar.com'
      );
    });
  });

  describe('Parameter Edge Cases', () => {
    beforeEach(() => {
      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({
        apiKey: 'test-api-key',
      });
    });

    it('should handle very long message text', async () => {
      const longMessage = 'A'.repeat(1000);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce(longMessage)
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue({
        return: {
          status: 200,
          message: 'Success',
        },
      });

      const result = await node.execute.call(mockExecuteFunctions);
      expect(result).toBeDefined();
      expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            message: longMessage,
          }),
        })
      );
    });

    it('should handle special characters in phone number', async () => {
      const specialPhoneNumber = '+98-912-345-6789';
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce(specialPhoneNumber)
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue({
        return: {
          status: 200,
          message: 'Success',
        },
      });

      const result = await node.execute.call(mockExecuteFunctions);
      expect(result).toBeDefined();
      expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            receptor: specialPhoneNumber,
          }),
        })
      );
    });
  });

  describe('Continue on Fail Behavior', () => {
    it('should continue processing when continueOnFail is true', async () => {
      (mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
        { json: {} },
        { json: {} },
      ]);

      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern')
        .mockReturnValueOnce('09987654321')
        .mockReturnValueOnce('Test message 2')
        .mockReturnValueOnce('test-pattern-2');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({
        apiKey: 'test-api-key',
      });

      // First request succeeds, second fails
      (mockExecuteFunctions.helpers.request as jest.Mock)
        .mockResolvedValueOnce({ return: { status: 200 } })
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json).toEqual({ return: { status: 200 } });
      expect(result[0][1].json).toEqual({ error: 'Network error' });
    });
  });
});