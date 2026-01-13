# Digital Wallet

A backend service for a digital wallet application built with Node.js, MySQL, and Knex.  
It provides a solid foundation for wallet management, user authentication, and transaction handling.

This project is designed for fintech-style applications such as digital wallets, payment platforms, and financial APIs.

---

## Features

- User authentication (OAuth / email-based)
- Wallet creation and balance management
- Secure transaction processing (credits & debits)
- Transaction history tracking
- RESTful API architecture
- Environment-based configuration
- SQL-based relational data modeling

---

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **MySQL**
- **Knex.js (Query Builder / ORM)**

- **JWT Authentication**
- **dotenv**

---

## Project Structure

```

digital-wallet/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── wallet.controller.ts
│   │   └── transaction.controller.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── wallet.routes.ts
│   │   └── transaction.routes.ts
│   │
│   ├── db/
│   │   ├── knex.ts
│   │   ├── migrations/
│   │   │   ├── 20240101_create_users.ts
│   │   │   ├── 20240102_create_wallets.ts
│   │   │   └── 20240103_create_transactions.ts
│   │   └── seeds/
│   │       ├── user.seed.ts
│   │       └── wallet.seed.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── wallet.service.ts
│   │   └── transaction.service.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── wallet.model.ts
│   │   └── transaction.model.ts
│   │
│   ├── utils/
│   │ 
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── wallet.test.ts
│   │   └── transaction.test.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .gitignore
├── README.md
├── knexfile.ts
├── nodemon.json
├── package-lock.json
├── package.json
└── tsconfig.json


````

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=digital_wallet

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
````

**Never commit your `.env` file or credentials to GitHub**

---

## Database & Migrations

This project uses **Knex migrations** to manage the MySQL schema.

### Run migrations

```bash
npx knex migrate:latest
```

### Rollback migrations

```bash
npx knex migrate:rollback
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/benedixit34/digital-wallet.git
cd digital-wallet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the application

```bash
npm run dev
```

The server should start on:

```
http://localhost:5000
```

---

## API Endpoints (Sample)

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/auth/register`   | Register a new user      |
| POST   | `/auth/login`      | Authenticate user        |
| GET    | `/wallet`          | Get wallet details       |
| POST   | `/wallet/fund`     | Fund wallet              |
| POST   | `/wallet/transfer` | Transfer funds           |
| GET    | `/transactions`    | View transaction history |

> Full API documentation coming soon.

---

## Security Notes

* All secrets are stored using environment variables
* JWT is used for authentication and session management
* Sensitive operations should be protected by middleware
* OAuth credentials should be rotated if exposed
* Database queries are handled via Knex to reduce SQL injection risk

---

## Author

**Benedict Emuh**
GitHub: [@benedixit34](https://github.com/benedixit34)

---

> *This project is a work in progress and under active development.*

