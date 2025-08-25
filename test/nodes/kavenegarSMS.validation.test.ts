import { KavenegarSMS } from '../../nodes/kavenegarSMS/kavenegarSMS.node';
import { IExecuteFunctions } from 'n8n-workflow';

// Mock the execute functions context
const mockExecuteFunctions = {
  getInputData: jest.fn().mockReturnValue([{ json: {} }]),
  getNodeParameter: jest.fn(),
  getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-api-key' }),
  getNode: jest.fn().mockReturnValue({ name: 'Kavenegar SMS' }),
  continueOnFail: jest.fn().mockReturnValue(false),
  helpers: {
    request: jest.fn().mockResolvedValue({ return: { status: 200 } }),
  },
} as unknown as IExecuteFunctions;

describe('KavenegarSMS Validation Tests', () => {
  let node: KavenegarSMS;

  beforeEach(() => {
    node = new KavenegarSMS();
    jest.clearAllMocks();
  });

  describe('Cell Number Validation', () => {
    it('should accept valid Iranian cell numbers', async () => {
      const validNumbers = [
        '09123456789',
        '09351234567',
        '09901234567',
        '+989123456789',
      ];

      for (const cellNumber of validNumbers) {
        (mockExecuteFunctions.getNodeParameter as jest.Mock)
          .mockReturnValueOnce(cellNumber) // cell
          .mockReturnValueOnce('Test message') // text
          .mockReturnValueOnce('test-pattern'); // pattern

        const result = await node.execute.call(mockExecuteFunctions);
        expect(result).toBeDefined();
        expect(result[0]).toHaveLength(1);
      }
    });

    it('should handle empty cell number', async () => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('') // empty cell
        .mockReturnValueOnce('Test message') // text
        .mockReturnValueOnce('test-pattern'); // pattern

      const result = await node.execute.call(mockExecuteFunctions);
      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
    });
  });

  describe('Message Text Validation', () => {
    it('should handle Persian text messages', async () => {
      const persianMessages = [
        'سلام دنیا',
        'پیامک تست',
        'متن فارسی با اعداد ۱۲۳',
        'ترکیب فارسی و English',
      ];

      for (const message of persianMessages) {
        (mockExecuteFunctions.getNodeParameter as jest.Mock)
          .mockReturnValueOnce('09123456789') // cell
          .mockReturnValueOnce(message) // text
          .mockReturnValueOnce('test-pattern'); // pattern

        const result = await node.execute.call(mockExecuteFunctions);
        expect(result).toBeDefined();
        expect(result[0]).toHaveLength(1);
      }
    });

    it('should handle English text messages', async () => {
      const englishMessages = [
        'Hello World',
        'Test SMS message',
        'Message with numbers 123',
        'Special chars: !@#$%^&*()',
      ];

      for (const message of englishMessages) {
        (mockExecuteFunctions.getNodeParameter as jest.Mock)
          .mockReturnValueOnce('09123456789') // cell
          .mockReturnValueOnce(message) // text
          .mockReturnValueOnce('test-pattern'); // pattern

        const result = await node.execute.call(mockExecuteFunctions);
        expect(result).toBeDefined();
        expect(result[0]).toHaveLength(1);
      }
    });

    it('should handle special characters in messages', async () => {
      const specialCharMessages = [
        'Message with emoji 😊',
        'Unicode: ñáéíóú',
        'Symbols: ©®™',
        'Mixed: Hello سلام 123 !@#',
      ];

      for (const message of specialCharMessages) {
        (mockExecuteFunctions.getNodeParameter as jest.Mock)
          .mockReturnValueOnce('09123456789') // cell
          .mockReturnValueOnce(message) // text
          .mockReturnValueOnce('test-pattern'); // pattern

        const result = await node.execute.call(mockExecuteFunctions);
        expect(result).toBeDefined();
        expect(result[0]).toHaveLength(1);
      }
    });

    it('should handle empty message text', async () => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789') // cell
        .mockReturnValueOnce('') // empty text
        .mockReturnValueOnce('test-pattern'); // pattern

      const result = await node.execute.call(mockExecuteFunctions);
      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
    });
  });

  describe('Pattern Validation', () => {
    it('should handle various pattern formats', async () => {
      const patterns = [
        'simple-pattern',
        'pattern_with_underscores',
        'pattern123',
        'UPPERCASE_PATTERN',
        'mixed-Case_Pattern123',
      ];

      for (const pattern of patterns) {
        (mockExecuteFunctions.getNodeParameter as jest.Mock)
          .mockReturnValueOnce('09123456789') // cell
          .mockReturnValueOnce('Test message') // text
          .mockReturnValueOnce(pattern); // pattern

        const result = await node.execute.call(mockExecuteFunctions);
        expect(result).toBeDefined();
        expect(result[0]).toHaveLength(1);
      }
    });

    it('should handle empty pattern', async () => {
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('09123456789') // cell
        .mockReturnValueOnce('Test message') // text
        .mockReturnValueOnce(''); // empty pattern

      const result = await node.execute.call(mockExecuteFunctions);
      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
    });
  });

  describe('Parameter Properties Validation', () => {
    it('should have all required properties defined', () => {
      const properties = node.description.properties || [];
      
      expect(properties).toHaveLength(3);
      
      const cellProperty = properties.find(p => p.name === 'cell');
      const textProperty = properties.find(p => p.name === 'text');
      const patternProperty = properties.find(p => p.name === 'pattern');
      
      expect(cellProperty).toBeDefined();
      expect(cellProperty?.required).toBe(true);
      expect(cellProperty?.type).toBe('string');
      
      expect(textProperty).toBeDefined();
      expect(textProperty?.required).toBe(true);
      expect(textProperty?.type).toBe('string');
      
      expect(patternProperty).toBeDefined();
      expect(patternProperty?.required).toBe(true);
      expect(patternProperty?.type).toBe('string');
    });

    it('should have proper display names and descriptions', () => {
      const properties = node.description.properties || [];
      
      const cellProperty = properties.find(p => p.name === 'cell');
      const textProperty = properties.find(p => p.name === 'text');
      const patternProperty = properties.find(p => p.name === 'pattern');
      
      expect(cellProperty?.displayName).toBe('Cell Number');
      expect(cellProperty?.description).toBe('Cell number to send the SMS');
      
      expect(textProperty?.displayName).toBe('Message Text');
      expect(textProperty?.description).toBe('The text to be sent in the SMS');
      
      expect(patternProperty?.displayName).toBe('Pattern Code');
      expect(patternProperty?.description).toBe('The pattern code to be used for the SMS');
    });
  });
});