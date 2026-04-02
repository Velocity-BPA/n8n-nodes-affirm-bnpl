import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AffirmBNPLApi implements ICredentialType {
	name = 'affirmBNPLApi';
	displayName = 'Affirm BNPL API';
	documentationUrl = 'https://docs.affirm.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
				{
					name: 'Production',
					value: 'production',
				},
			],
			default: 'sandbox',
		},
		{
			displayName: 'Public API Key',
			name: 'publicApiKey',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Private API Key',
			name: 'privateApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.affirm.com',
			description: 'Base URL for the Affirm API',
		},
	];
}