<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,45:4338CA,100:818CF8&height=210&section=header&text=Game%20API&fontSize=46&fontColor=FFFFFF&fontAlignY=38&desc=Node.js%20%7C%20Express%20%7C%20MySQL&descAlignY=60&descSize=17" width="100%" alt="Game API project banner" />

<p>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-REST%20API-111827?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

**A Node.js and Express backend with user and admin API modules, MySQL connectivity, and scheduled task support.**

</div>

---

## 📌 Overview

This repository contains the backend API for a game application. It is built with **Node.js**, **Express**, and **MySQL**, with separate folders for user-facing and admin API modules.

The codebase also includes authentication-related dependencies, file-upload utilities, and a cron-job library for scheduled tasks. Exact endpoints and business rules are defined in the source files.

## 🧰 Tech Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=nodejs,express,mysql&theme=dark" alt="Node.js, Express and MySQL" />

<br/>

<img src="https://img.shields.io/badge/Express-4.x-111827?style=flat-square&logo=express" alt="Express" />
<img src="https://img.shields.io/badge/MySQL-mysql2-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
<img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
<img src="https://img.shields.io/badge/Scheduler-node--cron-0F766E?style=flat-square" alt="node-cron" />

</div>

| Technology | Purpose |
|---|---|
| Node.js | Server-side JavaScript runtime |
| Express.js | HTTP server and API routing |
| MySQL | Relational database |
| JSON Web Token | Token-based authentication utilities |
| bcrypt | Password hashing utilities |
| dotenv | Environment variable configuration |
| Multer / Multiparty | File upload and multipart form handling |
| node-cron | Scheduled background jobs |
| CORS | Cross-origin request configuration |

## 📁 Project Structure

```text
game-api/
├── image/                 # Image assets
├── src/
│   ├── admin-api-folder/  # Admin API modules
│   ├── db/                # Database connection and helpers
│   ├── user-api-folder/   # User API modules
│   └── index.js           # Server entry point
├── test.rest              # REST client request examples
├── text.js                # Supporting script
├── package.json           # Dependencies and scripts
└── .gitignore
```

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- A running MySQL server
- Database credentials and environment values expected by the source code

### 1. Clone the repository

```bash
git clone https://github.com/maurya-sudhanshu/game-api.git
cd game-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file in the project root and add the values required by the database connection and application. Check `src/db/` and the source modules for the exact environment variable names.

Example placeholders:

```env
PORT=3000
# Add the database host, database name, username, password,
# and any token secrets required by the source code.
```

**Security:** Never commit actual database passwords, API credentials, or JWT secrets. If any real credentials have already been pushed to a public repository, rotate them.

### 4. Run in development mode

```bash
npm run dev
```

This command starts the API using Nodemon so the process can restart as files change.

### 5. Start the server

```bash
npm start
```

The server's base URL and port depend on the application configuration. Check the startup code and terminal output.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the server with Nodemon |
| `npm start` | Start the server with Node.js |
| `npm test` | Placeholder script; tests are not configured in `package.json` yet |

## 🔎 Testing API Endpoints

The repository includes `test.rest`, which can be used with a compatible REST client extension in Visual Studio Code. Review the request examples and adjust the base URL and payloads for your local environment.

## 🔐 Security Best Practices

- Validate incoming request bodies and query parameters.
- Use parameterized SQL queries for database operations.
- Hash passwords before storing them.
- Verify JWTs and enforce role-based access on protected admin endpoints.
- Restrict CORS to trusted frontend origins in production.
- Validate uploaded files by type and size.
- Keep secrets in environment variables and use HTTPS in production.
- Add automated tests for authentication, authorization, and critical API behavior.

## 🔗 Related Repository

If this API is used with a frontend application, configure the frontend's API base URL to point to the deployed backend environment.

---

<div align="center">

**Game API** · Built with Node.js, Express, and MySQL.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,45:4338CA,100:818CF8&height=100&section=footer" width="100%" alt="Footer decoration" />

</div>
