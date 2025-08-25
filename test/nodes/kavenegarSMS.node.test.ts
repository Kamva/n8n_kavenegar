import { KavenegarSMS } from '../../nodes/kavenegarSMS/kavenegarSMS.node';
import { IExecuteFunctions } from 'n8n-workflow';

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

describe('KavenegarSMS Node', () => {
  let node: KavenegarSMS;

  beforeEach(() => {
    node = new KavenegarSMS();
    jest.clearAllMocks();
  });

  describe('Node Properties', () => {
    it('should have correct display name', () => {
      expect(node.description.displayName).toBe('Kavenegar SMS');
    });

    it('should have correct description', () => {
      expect(node.description.description).toBe('Send an SMS through Kavenegar API');
    });

    it('should have correct inputs and outputs', () => {
      expect(node.description.inputs).toEqual(['main']);
      expect(node.description.outputs).toEqual(['main']);
    });

    it('should require kavenegarApi credentials', () => {
      expect(node.description.credentials).toEqual([
        {
          name: 'kavenegarApi',
          required: true,
        },
      ]);
    });
  });

  describe('Node Parameters', () => {
    it('should have correct properties defined', () => {
      expect(node.description.properties).toHaveLength(3);

      const properties = node.description.properties || [];
      expect(properties[0].name).toBe('cell');
      expect(properties[0].required).toBe(true);
      expect(properties[1].name).toBe('text');
      expect(properties[1].required).toBe(true);
      expect(properties[2].name).toBe('pattern');
      expect(properties[2].required).toBe(true);
    });

    it('should have correct parameter types', () => {
      const properties = node.description.properties || [];
      expect(properties[0].type).toBe('string');
      expect(properties[1].type).toBe('string');
      expect(properties[2].type).toBe('string');
    });
  });

  describe('SMS Sending', () => {
    it('should send SMS successfully', async () => {
      const mockCredentials = { apiKey: 'test-api-key' };
      const mockResponse = { return: { status: 200 } };

      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789') // cell
        .mockReturnValueOnce('Test message') // text
        .mockReturnValueOnce('test-pattern'); // pattern

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue(mockCredentials);
      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue(mockResponse);

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json).toEqual(mockResponse);
    });

    it('should throw error when credentials are missing', async () => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue(undefined);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'No credentials got returned!'
      );
    });

    it('should throw error when API returns non-200 status', async () => {
      const mockCredentials = { apiKey: 'test-api-key' };
      const mockResponse = { return: { status: 400 } };

      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue(mockCredentials);
      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue(mockResponse);

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'Kavenegar API request failed. Response: 400'
      );
    });

    it('should handle network errors', async () => {
      const mockCredentials = { apiKey: 'test-api-key' };

      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message')
        .mockReturnValueOnce('test-pattern');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue(mockCredentials);
      (mockExecuteFunctions.helpers.request as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Network error');
    });

    it('should handle multiple input items', async () => {
      const mockCredentials = { apiKey: 'test-api-key' };
      const mockResponse = { return: { status: 200 } };

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
        { json: {} },
        { json: {} },
      ]);

      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789')
        .mockReturnValueOnce('Test message 1')
        .mockReturnValueOnce('pattern1')
        .mockReturnValueOnce('09987654321')
        .mockReturnValueOnce('Test message 2')
        .mockReturnValueOnce('pattern2');

      (mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue(mockCredentials);
      (mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValue(mockResponse);

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
      expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(2);
    });
  });
});