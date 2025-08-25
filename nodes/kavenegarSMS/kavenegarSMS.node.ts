import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class KavenegarSMS implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Kavenegar SMS',
    name: 'kavenegarSMS',
    icon: 'file:kavenegar.svg',
    group: ['output'],
    version: 1,
    description: 'Send an SMS through Kavenegar API',
    defaults: {
      name: 'Kavenegar SMS',
      color: '#772244',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'kavenegarApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Cell Number',
        name: 'cell',
        type: 'string',
        default: '',
        placeholder: '09123456789',
        description: 'Cell number to send the SMS',
        required: true,
      },
      {
        displayName: 'Message Text',
        name: 'text',
        type: 'string',
        default: '',
        description: 'The text to be sent in the SMS',
        required: true,
      },
      {
        displayName: 'Pattern Code',
        name: 'pattern',
        type: 'string',
        default: '',
        description: 'The pattern code to be used for the SMS',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const cell = this.getNodeParameter('cell', i) as string;
        const text = this.getNodeParameter('text', i) as string;
        const pattern = this.getNodeParameter('pattern', i) as string;

        const credentials = await this.getCredentials('kavenegarApi');

        if (credentials === undefined || credentials === null) {
          throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
        }

        const apiKey = credentials.apiKey as string;

        const responseData = await this.helpers.request({
          method: 'POST',
          url: `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`,
          body: {
            receptor: cell,
            message: text,
            pattern_code: pattern,
          },
          json: true,
        });

        if (responseData.return.status !== 200) {
          throw new NodeOperationError(
            this.getNode(),
            `Kavenegar API request failed. Response: ${responseData.return.status}`
          );
        }

        returnData.push({
          json: responseData,
          pairedItem: {
            item: i,
          },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
            pairedItem: {
              item: i,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
