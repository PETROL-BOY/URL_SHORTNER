# URL Shortener API

A RESTful API service that allows users to create and manage shortened URLs.

## Features

- User authentication (signup/login)
- Create shortened URLs
- Custom URL codes (optional)
- Retrieve all shortened URLs for a user
- Delete shortened URLs
- Redirect to original URLs

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Drizzle ORM
- JSON Web Tokens (JWT)
- Zod (validation)
- Docker

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker & Docker Compose
- PostgreSQL

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgres://postgres:admin@localhost:5432/postgres
JWT_SECRET=your_jwt_secret