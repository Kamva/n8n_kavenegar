import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KavenegarApi implements ICredentialType {
	name = 'kavenegarApi';
	displayName = 'Kavenegar API';
	documentationUrl = 'https://kavenegar.com/rest.html';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The API Key from your Kavenegar account',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.kavenegar.com/v1/{{$credentials.apiKey}}/account/info.json',
			method: 'GET',
		},
	};
}