# Unizoy

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

## License

Licensed under the MIT license.
