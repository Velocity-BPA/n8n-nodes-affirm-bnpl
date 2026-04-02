# n8n-nodes-affirm-bnpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for integrating with Affirm's Buy Now Pay Later platform. This node provides access to 5 core resources (Checkout, Charge, Transaction, Authorization, Read Financing) enabling comprehensive payment processing workflows including checkout creation, charge management, transaction monitoring, and financing program administration.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![BNPL](https://img.shields.io/badge/BNPL-Affirm-orange)
![Payments](https://img.shields.io/badge/Payments-Processing-green)
![E-commerce](https://img.shields.io/badge/E--commerce-Integration-purple)

## Features

- **Checkout Management** - Create and configure Affirm checkout sessions for customer payment flows
- **Charge Processing** - Handle payment captures, refunds, and charge lifecycle management
- **Transaction Monitoring** - Track and analyze payment transaction status and history
- **Authorization Control** - Manage payment authorizations and approval workflows
- **Read Financing** - Access financing program details and customer eligibility information
- **Webhook Support** - Handle real-time payment status updates and notifications
- **Error Handling** - Comprehensive error management with detailed response mapping
- **Rate Limiting** - Built-in request throttling to respect API limits

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-affirm-bnpl`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-affirm-bnpl
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-affirm-bnpl.git
cd n8n-nodes-affirm-bnpl
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-affirm-bnpl
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Affirm API private key from merchant dashboard | Yes |
| Environment | Select Sandbox or Production environment | Yes |
| Public API Key | Your Affirm public API key for client-side operations | No |

## Resources & Operations

### 1. Checkout

| Operation | Description |
|-----------|-------------|
| Create | Create a new Affirm checkout session with cart and customer details |
| Get | Retrieve checkout session details and current status |
| Update | Modify existing checkout session parameters |
| Delete | Cancel and remove an active checkout session |

### 2. Charge

| Operation | Description |
|-----------|-------------|
| Create | Capture payment from an authorized checkout token |
| Get | Retrieve charge details and payment status |
| Update | Modify charge metadata and tracking information |
| Capture | Capture a previously authorized but uncaptured charge |
| Refund | Process full or partial refunds for completed charges |
| Void | Cancel an uncaptured authorized charge |

### 3. Transaction

| Operation | Description |
|-----------|-------------|
| List | Retrieve transaction history with filtering options |
| Get | Get detailed information about a specific transaction |
| Search | Search transactions by date range, amount, or status |

### 4. Authorization

| Operation | Description |
|-----------|-------------|
| Create | Create payment authorization for future capture |
| Get | Retrieve authorization details and expiration status |
| Void | Cancel an unused payment authorization |
| Extend | Extend authorization expiration date |

### 5. Read Financing

| Operation | Description |
|-----------|-------------|
| Get Programs | Retrieve available financing programs and rates |
| Get Terms | Get financing terms for specific cart amounts |
| Check Eligibility | Verify customer eligibility for financing options |

## Usage Examples

```javascript
// Create a new checkout session
{
  "merchant": {
    "user_confirmation_url": "https://mystore.com/confirm",
    "user_cancel_url": "https://mystore.com/cancel",
    "user_confirmation_url_action": "POST"
  },
  "shipping": {
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "address": {
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipcode": "94102",
      "country": "USA"
    }
  },
  "items": [{
    "display_name": "Awesome Product",
    "sku": "AWE-PROD-001",
    "unit_price": 25000,
    "qty": 2,
    "item_image_url": "https://mystore.com/product.jpg",
    "item_url": "https://mystore.com/products/awesome"
  }],
  "currency": "USD",
  "order_id": "ORDER-12345",
  "shipping_amount": 500,
  "tax_amount": 2500,
  "total": 52500
}
```

```javascript
// Capture a charge from checkout token
{
  "checkout_token": "ABCD1234EFGH5678",
  "order_id": "ORDER-12345",
  "shipping_carrier": "USPS",
  "shipping_confirmation": "1234567890"
}
```

```javascript
// Process a partial refund
{
  "charge_id": "CHRG-TEST-12345",
  "amount": 10000,
  "metadata": {
    "reason": "Customer return",
    "internal_id": "REF-001"
  }
}
```

```javascript
// Check financing eligibility
{
  "loan_amount": 50000,
  "currency": "USD",
  "customer": {
    "name": {
      "first": "Jane",
      "last": "Smith"
    },
    "email": "jane.smith@example.com",
    "phone_number": "555-123-4567"
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or missing API credentials | Verify API key is correct and has proper permissions |
| 400 Bad Request | Malformed request data or missing required fields | Check request payload against API documentation |
| 404 Not Found | Resource (charge, checkout, etc.) not found | Verify resource ID exists and is accessible |
| 422 Unprocessable Entity | Business logic error (insufficient funds, expired auth) | Review transaction details and customer account status |
| 429 Too Many Requests | Rate limit exceeded | Implement exponential backoff and retry logic |
| 500 Internal Server Error | Affirm service temporarily unavailable | Retry request after delay or contact Affirm support |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-affirm-bnpl/issues)
- **Affirm API Documentation**: [docs.affirm.com](https://docs.affirm.com)
- **Developer Portal**: [developers.affirm.com](https://developers.affirm.com)