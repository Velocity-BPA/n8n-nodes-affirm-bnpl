/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-affirmbnpl/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class AffirmBNPL implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Affirm BNPL',
    name: 'affirmbnpl',
    icon: 'file:affirmbnpl.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Affirm BNPL API',
    defaults: {
      name: 'Affirm BNPL',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'affirmbnplApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Checkout',
            value: 'checkout',
          },
          {
            name: 'Charge',
            value: 'charge',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Authorization',
            value: 'authorization',
          },
          {
            name: 'Read Financing',
            value: 'readFinancing',
          }
        ],
        default: 'checkout',
      },
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['checkout'] } },
  options: [
    { name: 'Create', value: 'create', description: 'Create a new checkout session', action: 'Create a checkout session' },
    { name: 'Get', value: 'get', description: 'Retrieve checkout session details', action: 'Get checkout session details' },
    { name: 'Capture', value: 'capture', description: 'Capture a checkout session after customer confirmation', action: 'Capture checkout session' }
  ],
  default: 'create',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['charge'] } },
	options: [
		{
			name: 'Create Charge',
			value: 'create',
			description: 'Create a new charge from checkout token',
			action: 'Create a charge',
		},
		{
			name: 'Get Charge',
			value: 'get',
			description: 'Retrieve charge details',
			action: 'Get a charge',
		},
		{
			name: 'Capture Charge',
			value: 'capture',
			description: 'Capture an authorized charge',
			action: 'Capture a charge',
		},
		{
			name: 'Void Charge',
			value: 'void',
			description: 'Void an uncaptured charge',
			action: 'Void a charge',
		},
		{
			name: 'Refund Charge',
			value: 'refund',
			description: 'Refund a captured charge',
			action: 'Refund a charge',
		},
		{
			name: 'Update Charge',
			value: 'update',
			description: 'Update charge order details',
			action: 'Update a charge',
		},
	],
	default: 'create',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
		},
	},
	options: [
		{
			name: 'Get',
			value: 'get',
			description: 'Retrieve specific transaction details',
			action: 'Get a transaction',
		},
		{
			name: 'Get All',
			value: 'getAll',
			description: 'List all transactions with filtering',
			action: 'Get all transactions',
		},
	],
	default: 'getAll',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['authorization'] } },
	options: [
		{ name: 'Create Authorization', value: 'create', description: 'Create a new payment authorization', action: 'Create a new authorization' },
		{ name: 'Get Authorization', value: 'get', description: 'Retrieve authorization details by ID', action: 'Get authorization details' },
		{ name: 'Capture Authorization', value: 'capture', description: 'Capture funds from an existing authorization', action: 'Capture an authorization' },
		{ name: 'Void Authorization', value: 'void', description: 'Cancel an existing authorization', action: 'Void an authorization' }
	],
	default: 'create',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['readFinancing'] } },
  options: [
    {
      name: 'Get Promotional Financing Options',
      value: 'get',
      description: 'Get promotional financing options for amount',
      action: 'Get promotional financing options'
    }
  ],
  default: 'get',
},
{
  displayName: 'Merchant Info',
  name: 'merchant',
  type: 'fixedCollection',
  required: true,
  displayOptions: { show: { resource: ['checkout'], operation: ['create'] } },
  default: {},
  typeOptions: { multipleValues: false },
  options: [
    {
      name: 'merchantValues',
      displayName: 'Merchant Details',
      values: [
        {
          displayName: 'User Confirmation URL',
          name: 'user_confirmation_url',
          type: 'string',
          required: true,
          default: '',
          description: 'URL to redirect user after successful checkout confirmation',
        },
        {
          displayName: 'User Cancel URL',
          name: 'user_cancel_url',
          type: 'string',
          required: true,
          default: '',
          description: 'URL to redirect user if they cancel the checkout',
        },
        {
          displayName: 'User Confirmation URL Action',
          name: 'user_confirmation_url_action',
          type: 'options',
          options: [
            { name: 'POST', value: 'POST' },
            { name: 'GET', value: 'GET' }
          ],
          default: 'POST',
          description: 'HTTP method for the confirmation URL callback',
        }
      ]
    }
  ]
},
{
  displayName: 'Items',
  name: 'items',
  type: 'fixedCollection',
  required: true,
  displayOptions: { show: { resource: ['checkout'], operation: ['create'] } },
  default: {},
  typeOptions: { multipleValues: true },
  options: [
    {
      name: 'itemValues',
      displayName: 'Item',
      values: [
        {
          displayName: 'Display Name',
          name: 'display_name',
          type: 'string',
          required: true,
          default: '',
          description: 'Name of the item as displayed to the customer',
        },
        {
          displayName: 'SKU',
          name: 'sku',
          type: 'string',
          default: '',
          description: 'Stock keeping unit identifier',
        },
        {
          displayName: 'Unit Price (Cents)',
          name: 'unit_price',
          type: 'number',
          required: true,
          default: 0,
          description: 'Price per unit in cents (USD)',
        },
        {
          displayName: 'Quantity',
          name: 'qty',
          type: 'number',
          required: true,
          default: 1,
          description: 'Quantity of this item',
        },
        {
          displayName: 'Item Image URL',
          name: 'item_image_url',
          type: 'string',
          default: '',
          description: 'URL to an image of the item',
        },
        {
          displayName: 'Item URL',
          name: 'item_url',
          type: 'string',
          default: '',
          description: 'URL to the item product page',
        }
      ]
    }
  ]
},
{
  displayName: 'Shipping Address',
  name: 'shipping',
  type: 'fixedCollection',
  displayOptions: { show: { resource: ['checkout'], operation: ['create'] } },
  default: {},
  typeOptions: { multipleValues: false },
  options: [
    {
      name: 'shippingValues',
      displayName: 'Shipping Details',
      values: [
        {
          displayName: 'Name',
          name: 'name',
          type: 'fixedCollection',
          default: {},
          typeOptions: { multipleValues: false },
          options: [
            {
              name: 'nameValues',
              displayName: 'Name',
              values: [
                {
                  displayName: 'First Name',
                  name: 'first',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Last Name',
                  name: 'last',
                  type: 'string',
                  default: '',
                }
              ]
            }
          ]
        },
        {
          displayName: 'Address',
          name: 'address',
          type: 'fixedCollection',
          default: {},
          typeOptions: { multipleValues: false },
          options: [
            {
              name: 'addressValues',
              displayName: 'Address',
              values: [
                {
                  displayName: 'Line 1',
                  name: 'line1',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Line 2',
                  name: 'line2',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'City',
                  name: 'city',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'State',
                  name: 'state',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Zipcode',
                  name: 'zipcode',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Country',
                  name: 'country',
                  type: 'string',
                  default: 'USA',
                }
              ]
            }
          ]
        }
      ]
    }
  ]
},
{
  displayName: 'Billing Address',
  name: 'billing',
  type: 'fixedCollection',
  displayOptions: { show: { resource: ['checkout'], operation: ['create'] } },
  default: {},
  typeOptions: { multipleValues: false },
  options: [
    {
      name: 'billingValues',
      displayName: 'Billing Details',
      values: [
        {
          displayName: 'Name',
          name: 'name',
          type: 'fixedCollection',
          default: {},
          typeOptions: { multipleValues: false },
          options: [
            {
              name: 'nameValues',
              displayName: 'Name',
              values: [
                {
                  displayName: 'First Name',
                  name: 'first',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Last Name',
                  name: 'last',
                  type: 'string',
                  default: '',
                }
              ]
            }
          ]
        },
        {
          displayName: 'Address',
          name: 'address',
          type: 'fixedCollection',
          default: {},
          typeOptions: { multipleValues: false },
          options: [
            {
              name: 'addressValues',
              displayName: 'Address',
              values: [
                {
                  displayName: 'Line 1',
                  name: 'line1',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Line 2',
                  name: 'line2',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'City',
                  name: 'city',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'State',
                  name: 'state',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Zipcode',
                  name: 'zipcode',
                  type: 'string',
                  default: '',
                },
                {
                  displayName: 'Country',
                  name: 'country',
                  type: 'string',
                  default: 'USA',
                }
              ]
            }
          ]
        },
        {
          displayName: 'Email',
          name: 'email',
          type: 'string',
          default: '',
          description: 'Customer email address',
        },
        {
          displayName: 'Phone Number',
          name: 'phone_number',
          type: 'string',
          default: '',
          description: 'Customer phone number',
        }
      ]
    }
  ]
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'fixedCollection',
  displayOptions: { show: { resource: ['checkout'], operation: ['create'] } },
  default: {},
  typeOptions: { multipleValues: true },
  options: [
    {
      name: 'metadataValues',
      displayName: 'Metadata',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'Metadata key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'Metadata value',
        }
      ]
    }
  ]
},
{
  displayName: 'Checkout Token',
  name: 'checkout_token',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['checkout'], operation: ['get', 'capture'] } },
  default: '',
  description: 'The checkout token to retrieve or capture',
},
{
	displayName: 'Checkout Token',
	name: 'checkout_token',
	type: 'string',
	required: true,
	default: '',
	description: 'The checkout token to create the charge from',
	displayOptions: {
		show: {
			resource: ['charge'],
			operation: ['create'],
		},
	},
},
{
	displayName: 'Charge ID',
	name: 'charge_id',
	type: 'string',
	required: true,
	default: '',
	description: 'The ID of the charge',
	displayOptions: {
		show: {
			resource: ['charge'],
			operation: ['get', 'capture', 'void', 'refund', 'update'],
		},
	},
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'number',
	required: true,
	default: 0,
	description: 'The amount to capture or refund in cents',
	displayOptions: {
		show: {
			resource: ['charge'],
			operation: ['capture', 'refund'],
		},
	},
},
{
	displayName: 'Order ID',
	name: 'order_id',
	type: 'string',
	default: '',
	description: 'The order identifier for the charge',
	displayOptions: {
		show: {
			resource: ['charge'],
			operation: ['update'],
		},
	},
},
{
	displayName: 'Shipping Carrier',
	name: 'shipping_carrier',
	type: 'string',
	default: '',
	description: 'The shipping carrier for the order',
	displayOptions: {
		show: {
			resource: ['charge'],
			operation: ['update'],
		},
	},
},
{
	displayName: 'Shipping Confirmation',
	name: 'shipping_confirmation',
	type: 'string',
	default: '',
	description: 'The shipping confirmation number',
	displayOptions: {
		show: {
			resource: ['charge'],
			operation: ['update'],
		},
	},
},
{
	displayName: 'Transaction ID',
	name: 'transactionId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['get'],
		},
	},
	default: '',
	placeholder: 'ABCD-EFGH-IJKL',
	description: 'The unique identifier of the transaction to retrieve',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getAll'],
		},
	},
	default: 50,
	typeOptions: {
		minValue: 1,
		maxValue: 100,
	},
	description: 'Maximum number of transactions to return (1-100)',
},
{
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getAll'],
		},
	},
	default: 0,
	typeOptions: {
		minValue: 0,
	},
	description: 'Number of transactions to skip for pagination',
},
{
	displayName: 'From Date',
	name: 'from',
	type: 'dateTime',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getAll'],
		},
	},
	default: '',
	description: 'Start date for transaction filtering (ISO 8601 format)',
},
{
	displayName: 'To Date',
	name: 'to',
	type: 'dateTime',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getAll'],
		},
	},
	default: '',
	description: 'End date for transaction filtering (ISO 8601 format)',
},
{
	displayName: 'Checkout Token',
	name: 'checkoutToken',
	type: 'string',
	displayOptions: { show: { resource: ['authorization'], operation: ['create'] } },
	default: '',
	required: true,
	description: 'The checkout token obtained from the checkout session'
},
{
	displayName: 'Authorization ID',
	name: 'authId',
	type: 'string',
	displayOptions: { show: { resource: ['authorization'], operation: ['get', 'capture', 'void'] } },
	default: '',
	required: true,
	description: 'The unique identifier of the authorization'
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'number',
	displayOptions: { show: { resource: ['authorization'], operation: ['capture'] } },
	default: 0,
	required: true,
	description: 'Amount to capture in cents (USD). Must not exceed the original authorization amount.'
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'number',
  required: true,
  displayOptions: { show: { resource: ['readFinancing'], operation: ['get'] } },
  default: 0,
  description: 'The transaction amount in cents (USD)',
  placeholder: '10000'
},
{
  displayName: 'Page Type',
  name: 'pageType',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['readFinancing'], operation: ['get'] } },
  default: 'product',
  description: 'The type of page where the financing options will be displayed',
  placeholder: 'product'
},
{
  displayName: 'Is in Checkout',
  name: 'isInCheckout',
  type: 'boolean',
  required: false,
  displayOptions: { show: { resource: ['readFinancing'], operation: ['get'] } },
  default: false,
  description: 'Whether the request is made from a checkout page'
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'checkout':
        return [await executeCheckoutOperations.call(this, items)];
      case 'charge':
        return [await executeChargeOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'authorization':
        return [await executeAuthorizationOperations.call(this, items)];
      case 'readFinancing':
        return [await executeReadFinancingOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeCheckoutOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('affirmbnplApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'create': {
          const merchant = this.getNodeParameter('merchant', i) as any;
          const items_param = this.getNodeParameter('items', i) as any;
          const shipping = this.getNodeParameter('shipping', i, {}) as any;
          const billing = this.getNodeParameter('billing', i, {}) as any;
          const metadata = this.getNodeParameter('metadata', i, {}) as any;

          const body: any = {
            merchant: merchant.merchantValues || {},
            items: items_param.itemValues || [],
            shipping: shipping.shippingValues || {},
            billing: billing.billingValues || {},
          };

          if (metadata.metadataValues && metadata.metadataValues.length > 0) {
            body.metadata = {};
            metadata.metadataValues.forEach((meta: any) => {
              if (meta.key && meta.value) {
                body.metadata[meta.key] = meta.value;
              }
            });
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/api/v2/checkout`,
            headers: {
              'Authorization': `Basic ${Buffer.from(`${credentials.publicApiKey}:${credentials.privateApiKey}`).toString('base64')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'get': {
          const checkout_token = this.getNodeParameter('checkout_token', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api/v2/checkout/${checkout_token}`,
            headers: {
              'Authorization': `Basic ${Buffer.from(`${credentials.publicApiKey}:${credentials.privateApiKey}`).toString('base64')}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'capture': {
          const checkout_token = this.getNodeParameter('checkout_token', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/api/v2/checkout/${checkout_token}/capture`,
            headers: {
              'Authorization': `Basic ${Buffer.from(`${credentials.publicApiKey}:${credentials.privateApiKey}`).toString('base64')}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeChargeOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('affirmbnplApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'create': {
					const checkoutToken = this.getNodeParameter('checkout_token', i) as string;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/charges`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
						},
						body: {
							checkout_token: checkoutToken,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'get': {
					const chargeId = this.getNodeParameter('charge_id', i) as string;
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/api/v1/charges/${chargeId}`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'capture': {
					const chargeId = this.getNodeParameter('charge_id', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/charges/${chargeId}/capture`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
						},
						body: {
							amount: amount,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'void': {
					const chargeId = this.getNodeParameter('charge_id', i) as string;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/charges/${chargeId}/void`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'refund': {
					const chargeId = this.getNodeParameter('charge_id', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/charges/${chargeId}/refund`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
						},
						body: {
							amount: amount,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'update': {
					const chargeId = this.getNodeParameter('charge_id', i) as string;
					const orderId = this.getNodeParameter('order_id', i) as string;
					const shippingCarrier = this.getNodeParameter('shipping_carrier', i) as string;
					const shippingConfirmation = this.getNodeParameter('shipping_confirmation', i) as string;
					
					const body: any = {};
					if (orderId) body.order_id = orderId;
					if (shippingCarrier) body.shipping_carrier = shippingCarrier;
					if (shippingConfirmation) body.shipping_confirmation = shippingConfirmation;

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/charges/${chargeId}/update`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
						},
						body: body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeTransactionOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('affirmbnplApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'get': {
					const transactionId = this.getNodeParameter('transactionId', i) as string;
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/api/v1/transactions/${transactionId}`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAll': {
					const limit = this.getNodeParameter('limit', i, 50) as number;
					const offset = this.getNodeParameter('offset', i, 0) as number;
					const from = this.getNodeParameter('from', i, '') as string;
					const to = this.getNodeParameter('to', i, '') as string;

					const queryParams: any = {
						limit: limit.toString(),
						offset: offset.toString(),
					};

					if (from) {
						queryParams.from = from;
					}

					if (to) {
						queryParams.to = to;
					}

					const queryString = new URLSearchParams(queryParams).toString();

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/api/v1/transactions?${queryString}`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
						{ itemIndex: i },
					);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeAuthorizationOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('affirmbnplApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'create': {
					const checkoutToken = this.getNodeParameter('checkoutToken', i) as string;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/authorizations`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`
						},
						body: {
							checkout_token: checkoutToken
						},
						json: true
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}
				
				case 'get': {
					const authId = this.getNodeParameter('authId', i) as string;
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/api/v1/authorizations/${authId}`,
						headers: {
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`
						},
						json: true
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}
				
				case 'capture': {
					const authId = this.getNodeParameter('authId', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/authorizations/${authId}/capture`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`
						},
						body: {
							amount: amount
						},
						json: true
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}
				
				case 'void': {
					const authId = this.getNodeParameter('authId', i) as string;
					
					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/api/v1/authorizations/${authId}/void`,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Basic ${Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64')}`
						},
						json: true
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}
				
				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i }
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i }
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeReadFinancingOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('affirmbnplApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'get': {
          const amount = this.getNodeParameter('amount', i) as number;
          const pageType = this.getNodeParameter('pageType', i) as string;
          const isInCheckout = this.getNodeParameter('isInCheckout', i) as boolean;

          const queryParams = new URLSearchParams({
            amount: amount.toString(),
            page_type: pageType,
            is_in_checkout: isInCheckout.toString()
          });

          const auth = Buffer.from(`${credentials.publicKey}:${credentials.privateKey}`).toString('base64');

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api/v2/promo/read_financing?${queryParams.toString()}`,
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            },
            json: true
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}
