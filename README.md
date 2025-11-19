# URL_SHORTNER

A full‑stack URL shortener built with Node.js, Drizzle ORM, and Docker — featuring clean API routes, database migrations, and modular services.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [Development](#development)
- [License](#license)

---

## Features

- 🔗 **Shorten long URLs** into compact, shareable links  
- 🛡️ **Input validation** and error handling via custom middleware  
- 🗃️ **Database migrations** and schema management using Drizzle ORM  
- 🧩 **Modular architecture** with services, routes, and models  
- 🚀 **Dockerized setup** for easy deployment and scalability  
- 📊 **Analytics-ready structure** for tracking URL usage  
- ⚡ **Lightning-fast redirects** with optimized database queries  
- 🔒 **Environment-based configuration** for security  

---

## Tech Stack

**Backend**  
- Node.js (v18+)  
- Express.js (REST API)  
- Drizzle ORM (type-safe database toolkit)  

**Database**  
- PostgreSQL (relational database)  

**Containerization**  
- Docker  
- Docker Compose  

**Package Management**  
- pnpm (fast, disk-efficient package manager)  

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)  
- **pnpm** (v8 or higher) — Install via `npm install -g pnpm`  
- **Docker** and **Docker Compose** — [Get Docker](https://www.docker.com/get-started)  
- **Git** — [Download](https://git-scm.com/)  

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/PETROL-BOY/URL_SHORTNER.git
cd URL_SHORTNER
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/url_shortener

# Server Configuration
PORT=3000
NODE_ENV=development

# Application Settings
BASE_URL=http://localhost:3000
SHORT_URL_LENGTH=6
```

### 4. Set Up the Database

**Using Docker (Recommended):**

```bash
docker-compose up -d db
```

**Using Local PostgreSQL:**

```sql
CREATE DATABASE url_shortener;
```

### 5. Run Database Migrations

```bash
pnpm db:migrate
```

### 6. Start the Application

**Development Mode:**

```bash
pnpm dev
```

**Using Docker Compose (Full Stack):**

```bash
docker-compose up --build
```

The application will be available at: **`http://localhost:3000`**

---

## API Endpoints

### 1. Create Short URL

**`POST /api/shorten`**

Create a new shortened URL.

**Request Body:**
```json
{
  "originalUrl": "https://www.example.com/very/long/url/path"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "originalUrl": "https://www.example.com/very/long/url/path",
    "shortUrl": "http://localhost:3000/abc123",
    "createdAt": "2025-11-19T12:51:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid URL format"
}
```

---

### 2. Redirect to Original URL

**`GET /:shortCode`**

Redirect to the original URL using the short code.

**Example:**
```bash
curl http://localhost:3000/abc123
# Redirects to: https://www.example.com/very/long/url/path
```

**Response:**
- **302 Found** (redirect to original URL)  
- **404 Not Found** (if short code doesn't exist)

---

### 3. Get URL Details

**`GET /api/url/:shortCode`**

Retrieve details about a shortened URL without redirecting.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "originalUrl": "https://www.example.com/very/long/url/path",
    "shortUrl": "http://localhost:3000/abc123",
    "clicks": 42,
    "createdAt": "2025-11-19T12:51:00.000Z"
  }
}
```

---

### 4. Health Check

**`GET /health`**

Check if the server is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T12:51:00.000Z"
}
```

---

## Folder Structure

```
URL_SHORTNER/
│
├── db/                       # Database configuration and migrations
│   ├── drizzle/              # Generated migration files
│   ├── schema.js             # Drizzle schema definitions
│   └── index.js              # Database connection setup
│
├── middlewares/              # Custom middleware functions
│   ├── errorHandler.js       # Global error handling
│   ├── validateUrl.js        # URL validation middleware
│   └── rateLimiter.js        # Rate limiting
│
├── models/                   # Data models and entity definitions
│   └── url.model.js          # URL entity model
│
├── routes/                   # API route handlers
│   ├── index.js              # Main router
│   ├── shorten.routes.js     # URL shortening endpoints
│   └── redirect.routes.js    # Redirect handler
│
├── services/                 # Business logic layer
│   ├── url.service.js        # URL shortening logic
│   ├── analytics.service.js  # Click tracking
│   └── shortCode.service.js  # Short code generation
│
├── utils/                    # Helper functions and utilities
│   ├── generateShortCode.js  # Random short code generator
│   ├── validateUrl.js        # URL validation helper
│   └── logger.js             # Logging utility
│
├── validation/               # Input validation schemas
│   └── url.validation.js     # URL validation rules
│
├── view/                     # Static files or frontend templates
│   ├── index.html            # Landing page
│   └── assets/               # CSS, JS, images
│
├── .env.example              # Sample environment configuration
├── .gitignore                # Git ignore rules
├── docker-compose.yml        # Docker multi-container setup
├── Dockerfile                # Application container definition
├── drizzle.config.js         # Drizzle ORM configuration
├── index.js                  # Application entry point
├── package.json              # Project metadata and scripts
├── pnpm-lock.yaml            # Dependency lock file
└── README.md                 # Project documentation
```

---

## Database Schema

The application uses the following database schema with Drizzle ORM:

```javascript
// db/schema.js
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const urls = pgTable('urls', {
  id: serial('id').primaryKey(),
  shortCode: text('short_code').notNull().unique(),
  originalUrl: text('original_url').notNull(),
  clicks: integer('clicks').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Table: `urls`**

| Column       | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | SERIAL    | Primary key (auto-increment)         |
| shortCode    | TEXT      | Unique short code (e.g., "abc123")   |
| originalUrl  | TEXT      | Original long URL                    |
| clicks       | INTEGER   | Number of times URL was accessed     |
| createdAt    | TIMESTAMP | Creation timestamp                   |
| updatedAt    | TIMESTAMP | Last update timestamp                |

---

## Development

### Available Scripts

```bash
# Start development server with hot reload
pnpm dev

# Start production server
pnpm start

# Run database migrations
pnpm db:migrate

# Generate new migrations (after schema changes)
pnpm db:generate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Run tests
pnpm test
```

### Adding New Features

1. **Create a new route** in `routes/`  
2. **Add business logic** in `services/`  
3. **Update validation schemas** in `validation/`  
4. **Add middleware** if needed in `middlewares/`  
5. **Update database schema** in `db/schema.js` and run `pnpm db:generate`

### Code Style Guidelines

- Use **ES6+ syntax** (const, arrow functions, destructuring)  
- Follow **RESTful API conventions**  
- Write **descriptive commit messages**  
- Add **error handling** for all async operations  
- Use **environment variables** for configuration  

---

## Docker Deployment

Build and run the entire stack:

```bash
docker-compose up --build -d
```

Stop the containers:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f
```

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 PETROL-BOY

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**  
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`  
3. **Commit your changes**: `git commit -m 'Add amazing feature'`  
4. **Push to the branch**: `git push origin feature/amazing-feature`  
5. **Open a Pull Request**  

---

## Support

If you encounter any issues or have questions:

- **Open an issue**: [GitHub Issues](https://github.com/PETROL-BOY/URL_SHORTNER/issues)  

---

## Acknowledgments

- Built with [Drizzle ORM](https://orm.drizzle.team/)  
- Powered by [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/)  
- Containerized with [Docker](https://www.docker.com/)  

---

**Made with ❤️ by [PETROL-BOY](https://github.com/PETROL-BOY)**
