# Payment Service - Cash on Delivery (COD)

This is a mock payment service that implements Cash on Delivery (COD) payment method without any external payment gateway dependencies.

## Features

- ✅ **No External Dependencies**: No Stripe, PayPal, or other payment gateway required
- ✅ **Simple Mock Implementation**: All payment logic is handled in-memory
- ✅ **Kafka Integration**: Sends payment success events to other services
- ✅ **No Environment Variables Required**: Works out of the box without API keys
- ✅ **Development-Friendly**: Perfect for testing and development

## How It Works

### 1. Create Checkout Session

**Endpoint:** `POST /sessions/create-checkout-session`

**Request Body:**
```json
{
  "userId": "user_123",
  "cart": [
    {
      "id": 1,
      "name": "Product Name",
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "checkoutSessionClientSecret": "cod_abc-123-def-456",
  "sessionId": "abc-123-def-456",
  "message": "Cash on Delivery order created",
  "totalAmount": 99.98
}
```

### 2. Get Session Status

**Endpoint:** `GET /sessions/:session_id`

**Response:**
```json
{
  "status": "complete",
  "paymentStatus": "unpaid",
  "paymentMethod": "cash_on_delivery",
  "amount_total": 9998
}
```

### 3. Confirm COD Order (Optional)

**Endpoint:** `POST /webhooks/cod-confirm`

**Request Body:**
```json
{
  "sessionId": "abc-123-def-456",
  "userId": "user_123",
  "email": "user@example.com",
  "amount": 9998,
  "products": [
    {
      "name": "Product Name",
      "quantity": 2,
      "price": 4999
    }
  ]
}
```

## Kafka Events

### Produces

- **`payment.successful`**: Sent when a COD order is confirmed
  ```json
  {
    "userId": "user_123",
    "email": "user@example.com",
    "amount": 9998,
    "status": "pending",
    "paymentMethod": "cash_on_delivery",
    "products": [...]
  }
  ```

### Consumes

- **`product.created`**: Stores product information in memory for pricing
- **`product.deleted`**: Removes product from memory

## Running the Service

```bash
# Install dependencies
bun install

# Run in development mode
bun dev

# Run in production mode
bun start
```

The service will start on port **8002** by default.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| POST | `/sessions/create-checkout-session` | Create a new COD checkout session |
| GET | `/sessions/:session_id` | Get session status |
| POST | `/webhooks/cod-confirm` | Manually confirm a COD order |
| GET | `/webhooks/` | Webhook health check |

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /sessions/create-checkout-session
       │ { userId, cart }
       ▼
┌─────────────────────────┐
│   Payment Service       │
│   (Port 8002)           │
│                         │
│  • Creates mock session │
│  • Stores in memory     │
│  • Returns session ID   │
└──────────┬──────────────┘
           │
           │ Kafka Event: payment.successful
           ▼
    ┌──────────────┐
    │ Order Service│
    └──────────────┘
```

## Differences from Stripe Integration

| Feature | Stripe | COD (Current) |
|---------|--------|---------------|
| External API | ✅ Required | ❌ Not needed |
| API Keys | ✅ Required | ❌ Not needed |
| Webhooks | ✅ Complex setup | ✅ Simple mock |
| Payment Status | Real-time | Instant (mock) |
| Build Complexity | High | Low |
| Development | Requires test keys | Works immediately |

## Future Enhancements

If you want to add real payment processing later:

1. Install Stripe SDK: `bun add stripe`
2. Replace mock implementations in:
   - `src/utils/stripe.ts`
   - `src/routes/session.route.ts`
   - `src/routes/webhooks.route.ts`
3. Add environment variables for API keys
4. Update the frontend to handle Stripe checkout flow

## Testing

### Health Check
```bash
curl http://localhost:8002/health
```

### Create COD Order
```bash
curl -X POST http://localhost:8002/sessions/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "cart": [
      {"id": 1, "name": "Test Product", "quantity": 1}
    ]
  }'
```

### Get Session Status
```bash
curl http://localhost:8002/sessions/your-session-id
```

## Notes

- **Payment Status**: All COD orders are marked as `"unpaid"` since payment happens on delivery
- **Session Status**: Sessions are marked as `"complete"` immediately after creation
- **Storage**: Sessions are stored in memory and will be lost on service restart
- **Production**: For production use, consider implementing persistent storage or integrating a real payment gateway
