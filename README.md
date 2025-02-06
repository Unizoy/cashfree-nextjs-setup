# Unizoy Cashfree Next.js

A modern web application built with Next.js 13, focusing on educational technology and student services.

## About this project

This project as an experiment to see how a modern app (with features like authentication, subscriptions, API routes, static pages for docs ...etc) would work in Next.js 13 and server components. It integrates with Cashfree for payments and Prisma for database.

## Features

- New `/app` dir with Next.js 13
- Server and Client Components
- Authentication using **NextAuth.js**
- Database with **Prisma** and **MySql**
- Payment integration with **Cashfree**
- UI Components built using **shadcn/ui**
- Styled using **Tailwind CSS**
- Form handling with **react-hook-form**
- Validations using **Zod**
- Written in **TypeScript**

## Running Locally

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Copy `.env.example` to `.env.local` and update the variables:

```sh
cp .env.example .env.local
```

3. Start the development server:

```sh
pnpm dev
```

## Environment Variables

Required environment variables:

```
NEXTAUTH_URL=
NEXTAUTH_SECRET=


GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_ACCESS_TOKEN=

DATABASE_URL=

NEXT_PUBLIC_CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=

```

## Cashfree Payment Gateway Setup

### Prerequisites

1. Create a Cashfree account at [Cashfree Merchant Dashboard](https://merchant.cashfree.com)
2. Obtain your App ID and Secret Key from the Cashfree Dashboard
3. Set up your domain in the Cashfree Dashboard's allowed domains

### Environment Variables

Add the following environment variables to your `.env` file:

```
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_API_ENDPOINT=https://sandbox.cashfree.com/pg # Use production URL for live
```

### Integration Steps

1. **Install Cashfree SDK**
   `npm install cashfree-sdk`

2. **Initialize Cashfree in your application**

```javascript
import { Cashfree } from "cashfree-sdk"

const cashfree = new Cashfree({
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  environment: "sandbox", // Use 'production' for live
})
```

3. **Test Mode vs Production Mode**

- Use `sandbox` environment for testing
- Switch to `production` environment for live transactions
- Update the API endpoint accordingly in your environment variables

### Important Notes

- Always keep your Secret Key confidential
- Implement proper error handling for payment failures
- Test thoroughly in sandbox mode before going live
- Follow Cashfree's security best practices
- Maintain proper logs for transaction tracking

### Additional Resources

- [Cashfree API Documentation](https://docs.cashfree.com/docs/)
- [Cashfree Testing Guide](https://docs.cashfree.com/docs/testing)

## License

Licensed under the MIT license.
