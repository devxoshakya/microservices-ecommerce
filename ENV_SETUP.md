# Environment Variables Setup Guide

This guide will help you set up all the necessary environment variables for the microservices e-commerce application.

## Overview

The application consists of multiple services, each requiring specific environment variables:

- **Client App** (Next.js) - Port 3002
- **Admin App** (Next.js) - Port 3003
- **Product Service** (Express) - Port 8000
- **Order Service** (Fastify) - Port 8001
- **Payment Service** (Hono) - Port 8002
- **Auth Service** (Express) - Port 8003
- **Email Service** (Node.js) - Kafka consumer only

## Quick Setup

1. Copy the `.env.example` files to `.env` in each service directory:

```bash
# From the root directory
cp apps/client/.env.example apps/client/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/product-service/.env.example apps/product-service/.env
cp apps/order-service/.env.example apps/order-service/.env
cp apps/payment-service/.env.example apps/payment-service/.env
cp apps/email-service/.env.example apps/email-service/.env
```

2. Fill in the actual values for each service (see detailed sections below).

## Service-Specific Configuration

### 1. Clerk Authentication Setup

**Required for:** All services

1. Create a Clerk account at [clerk.dev](https://clerk.dev)
2. Create a new application
3. Get your keys from the Clerk dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (for client-side apps)
   - `CLERK_SECRET_KEY` (for server-side services)

**Configure in:**
- `apps/client/.env`
- `apps/admin/.env`
- `apps/auth-service/.env`
- `apps/product-service/.env`
- `apps/order-service/.env`
- `apps/payment-service/.env`

### 2. Database Setup

#### PostgreSQL (Product Service)
1. Install PostgreSQL locally or use a cloud provider
2. Create a database named `ecommerce_products`
3. Update `DATABASE_URL` in `apps/product-service/.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_products
   ```

#### MongoDB (Order Service)
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGO_URL` in `apps/order-service/.env`:
   ```
   MONGO_URL=mongodb://localhost:27017/ecommerce_orders
   ```

### 3. Kafka Setup

**Required for:** All backend services

1. Start Kafka using the provided docker-compose:
   ```bash
   cd packages/kafka
   docker-compose up -d
   ```

The Kafka broker will be available at:
- `localhost:9092`

### 4. Stripe Payment Setup

**Required for:** Payment Service

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test keys from the Stripe dashboard
3. Update `apps/payment-service/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### 5. Google Email Setup

**Required for:** Email Service

1. Create a Google Cloud Project
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Generate a refresh token
5. Update `apps/email-service/.env`:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
   ```

### 6. Cloudinary Setup (Optional)

**Required for:** Admin App (for image uploads)

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name and create an upload preset
3. Update `apps/admin/.env`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
   ```

## Port Configuration

Default ports are configured as follows:

| Service | Port | Environment Variable |
|---------|------|---------------------|
| Client App | 3002 | NEXT_PUBLIC_APP_URL |
| Admin App | 3003 | NEXT_PUBLIC_APP_URL |
| Product Service | 8000 | PORT |
| Order Service | 8001 | PORT |
| Payment Service | 8002 | PORT |
| Auth Service | 8003 | PORT |

## Service URLs

Make sure the service URLs in the frontend apps match your backend service ports:

**Client App (`apps/client/.env`):**
```
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:8002
```

**Admin App (`apps/admin/.env`):**
```
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8003
```

## Running the Application

1. Start Kafka:
   ```bash
   cd packages/kafka
   docker-compose up -d
   ```

2. Start all services (from root directory):
   ```bash
   # Install dependencies
   bun install

   # Start all services in development mode
   bun dev
   ```

3. Or start services individually:
   ```bash
   # Backend services
   cd apps/product-service && bun dev
   cd apps/order-service && bun dev
   cd apps/payment-service && bun dev
   cd apps/auth-service && bun dev
   cd apps/email-service && bun dev

   # Frontend apps
   cd apps/client && bun dev
   cd apps/admin && bun dev
   ```

## Troubleshooting

### Common Issues

1. **Clerk Authentication Errors**
   - Ensure your Clerk keys are correct
   - Check that the publishable key is used in frontend apps
   - Verify the secret key is used in backend services

2. **Database Connection Errors**
   - Verify database is running
   - Check connection strings
   - Ensure databases exist

3. **Kafka Connection Errors**
   - Ensure Kafka is running via Docker Compose
   - Check if port 9092 is available

4. **Service Communication Errors**
   - Verify all service URLs are correct
   - Check that backend services are running on expected ports
   - Ensure CORS is properly configured

### Health Checks

Each service has a health endpoint:

- Product Service: http://localhost:8000/health
- Order Service: http://localhost:8001/health
- Payment Service: http://localhost:8002/health
- Auth Service: http://localhost:8003/health

## Security Notes

- Never commit `.env` files to version control
- Use different keys for development, staging, and production
- Regularly rotate API keys and secrets
- Use environment-specific Clerk applications
- Enable webhook signature verification for Stripe

## Environment Files Summary

```
apps/
├── client/.env                 # Next.js client app
├── admin/.env                  # Next.js admin app
├── auth-service/.env          # Express auth service
├── product-service/.env       # Express product service
├── order-service/.env         # Fastify order service
├── payment-service/.env       # Hono payment service
└── email-service/.env         # Node.js email service
```

All `.env.example` files are provided as templates with the required variables for each service.