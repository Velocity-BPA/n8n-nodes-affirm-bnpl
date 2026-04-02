/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { AffirmBNPL } from '../nodes/Affirm BNPL/Affirm BNPL.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('AffirmBNPL Node', () => {
  let node: AffirmBNPL;

  beforeAll(() => {
    node = new AffirmBNPL();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Affirm BNPL');
      expect(node.description.name).toBe('affirmbnpl');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Checkout Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        publicApiKey: 'test-public-key',
        privateApiKey: 'test-private-key',
        baseUrl: 'https://api.affirm.com'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('create operation', () => {
    it('should create checkout session successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('create')
        .mockReturnValueOnce({
          merchantValues: {
            user_confirmation_url: 'https://example.com/confirm',
            user_cancel_url: 'https://example.com/cancel',
            user_confirmation_url_action: 'POST'
          }
        })
        .mockReturnValueOnce({
          itemValues: [{
            display_name: 'Test Product',
            unit_price: 5000,
            qty: 1,
            sku: 'TEST-001'
          }]
        })
        .mockReturnValueOnce({})
        .mockReturnValueOnce({})
        .mockReturnValueOnce({});

      const mockResponse = { checkout_token: 'token_123', redirect_url: 'https://affirm.com/checkout' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCheckoutOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.affirm.com/api/v2/checkout',
        })
      );
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle create operation errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('create');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeCheckoutOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('get operation', () => {
    it('should get checkout session successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('get')
        .mockReturnValueOnce('token_123');

      const mockResponse = { checkout_token: 'token_123', status: 'pending' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCheckoutOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://api.affirm.com/api/v2/checkout/token_123',
        })
      );
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('capture operation', () => {
    it('should capture checkout session successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('capture')
        .mockReturnValueOnce('token_123');

      const mockResponse = { transaction_id: 'txn_123', status: 'captured' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCheckoutOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.affirm.com/api/v2/checkout/token_123/capture',
        })
      );
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Charge Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://api.affirm.com',
				publicKey: 'test-public-key',
				privateKey: 'test-private-key',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should create a charge successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('create');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('test_checkout_token');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'charge_123', status: 'created' });

		const result = await executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ id: 'charge_123', status: 'created' });
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.affirm.com/api/v1/charges',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': expect.stringContaining('Basic'),
			},
			body: { checkout_token: 'test_checkout_token' },
			json: true,
		});
	});

	it('should get charge details successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('get');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('charge_123');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'charge_123', amount: 10000 });

		const result = await executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ id: 'charge_123', amount: 10000 });
	});

	it('should capture a charge successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('capture');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('charge_123');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(5000);
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'charge_123', status: 'captured' });

		const result = await executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ id: 'charge_123', status: 'captured' });
	});

	it('should void a charge successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('void');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('charge_123');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'charge_123', status: 'voided' });

		const result = await executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ id: 'charge_123', status: 'voided' });
	});

	it('should refund a charge successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('refund');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('charge_123');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(2500);
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'refund_456', amount: 2500 });

		const result = await executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ id: 'refund_456', amount: 2500 });
	});

	it('should update a charge successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('update');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('charge_123');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('order_789');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('UPS');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('1Z123456789');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'charge_123', updated: true });

		const result = await executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ id: 'charge_123', updated: true });
	});

	it('should handle errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('get');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('invalid_charge');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Charge not found'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('Charge not found');
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('get');
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('invalid_charge');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Charge not found'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);

		await expect(executeChargeOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Charge not found');
	});
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				publicKey: 'test-public-key',
				privateKey: 'test-private-key',
				baseUrl: 'https://api.affirm.com',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('get operation', () => {
		it('should retrieve a specific transaction successfully', async () => {
			const mockTransaction = {
				id: 'ABCD-EFGH-IJKL',
				amount: 15000,
				status: 'confirmed',
				created: '2023-12-01T10:00:00Z',
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('ABCD-EFGH-IJKL');
			
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransaction);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.affirm.com/api/v1/transactions/ABCD-EFGH-IJKL',
				headers: {
					Authorization: expect.stringContaining('Basic'),
					'Content-Type': 'application/json',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockTransaction,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle get transaction error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('invalid-id');
			
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
				new Error('Transaction not found'),
			);
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: { error: 'Transaction not found' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getAll operation', () => {
		it('should retrieve all transactions successfully', async () => {
			const mockTransactions = {
				transactions: [
					{ id: 'ABCD-1', amount: 10000, status: 'confirmed' },
					{ id: 'ABCD-2', amount: 20000, status: 'pending' },
				],
				total: 2,
				has_more: false,
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAll')
				.mockReturnValueOnce(50)
				.mockReturnValueOnce(0)
				.mockReturnValueOnce('2023-12-01T00:00:00Z')
				.mockReturnValueOnce('2023-12-31T23:59:59Z');
			
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactions);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/api/v1/transactions?'),
				headers: {
					Authorization: expect.stringContaining('Basic'),
					'Content-Type': 'application/json',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockTransactions,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle getAll transactions error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAll')
				.mockReturnValueOnce(50)
				.mockReturnValueOnce(0)
				.mockReturnValueOnce('')
				.mockReturnValueOnce('');
			
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
				new Error('API rate limit exceeded'),
			);
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: { error: 'API rate limit exceeded' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});
});

describe('Authorization Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				publicKey: 'test-public-key',
				privateKey: 'test-private-key',
				baseUrl: 'https://api.affirm.com'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn()
			}
		};
	});

	describe('create operation', () => {
		it('should create authorization successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'create';
				if (param === 'checkoutToken') return 'test-checkout-token';
				return null;
			});

			const mockResponse = { id: 'auth_123', status: 'authorized', amount: 10000 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAuthorizationOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});

		it('should handle create authorization error', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'create';
				if (param === 'checkoutToken') return 'invalid-token';
				return null;
			});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid checkout token'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAuthorizationOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toContain('Invalid checkout token');
		});
	});

	describe('get operation', () => {
		it('should get authorization successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'get';
				if (param === 'authId') return 'auth_123';
				return null;
			});

			const mockResponse = { id: 'auth_123', status: 'authorized', amount: 10000 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAuthorizationOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('capture operation', () => {
		it('should capture authorization successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'capture';
				if (param === 'authId') return 'auth_123';
				if (param === 'amount') return 5000;
				return null;
			});

			const mockResponse = { id: 'charge_123', amount: 5000, status: 'captured' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAuthorizationOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('void operation', () => {
		it('should void authorization successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'void';
				if (param === 'authId') return 'auth_123';
				return null;
			});

			const mockResponse = { id: 'auth_123', status: 'voided' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAuthorizationOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});
});

describe('Read Financing Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        publicKey: 'test-public-key',
        privateKey: 'test-private-key',
        baseUrl: 'https://api.affirm.com'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('get operation', () => {
    it('should get promotional financing options successfully', async () => {
      const mockResponse = {
        amount: 10000,
        promo: {
          apr: 0,
          months: 12,
          type: 'installment'
        }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('get')
        .mockReturnValueOnce(10000)
        .mockReturnValueOnce('product')
        .mockReturnValueOnce(false);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeReadFinancingOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.affirm.com/api/v2/promo/read_financing?amount=10000&page_type=product&is_in_checkout=false',
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle API errors gracefully when continueOnFail is true', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('get')
        .mockReturnValueOnce(10000)
        .mockReturnValueOnce('product')
        .mockReturnValueOnce(false);
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeReadFinancingOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });

    it('should throw error when continueOnFail is false', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('get')
        .mockReturnValueOnce(10000)
        .mockReturnValueOnce('product')
        .mockReturnValueOnce(false);
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(executeReadFinancingOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      )).rejects.toThrow('API Error');
    });
  });
});
});
