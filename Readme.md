# 🩸 Blood Donation Application - Backend

Backend API server for the Blood Donation Application built using Node.js, Express.js, MongoDB, and JWT Authentication.

This server handles authentication, authorization, donation request management, funding APIs, user management, and secure database operations.

---

## 🌐 Server Live Link

👉 API Live Link: https://life-link-backend.vercel.app/

---

##  Project Purpose

The backend powers the Blood Donation Application by providing:

- Secure REST APIs
- JWT Authentication
- Role-Based Authorization
- MongoDB Database Operations
- Donation Request Management
- Funding & Payment Integration

---

## Main Features

### Authentication & Security
- JWT Authentication
- Role-Based Middleware
- Protected APIs
- Secure Environment Variables
- CORS Protection

### User Management
- User Registration
- Update User Profile
- Block / Unblock Users
- Role Management
- Active / Blocked Status System

### Donation Request System
- Create Donation Request
- Update Donation Status
- Delete Donation Request
- Filter Donation Requests
- Pagination Support

### Funding System
- Stripe Payment Integration
- Store Funding History
- Funding Statistics

### Admin Features
- Total Users Count
- Total Donation Requests
- Total Funding Statistics

---

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- JWT
- Firebase Admin SDK
- Stripe
- dotenv
- cors
- cookie-parser

---

## Project Structure

```bash
src/
│
├── routes/
├── controllers/
├── middleware/
├── models/
├── utils/
├── config/
└── index.js
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

DB_USER=your_db_user
DB_PASS=your_db_password

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret

FB_TYPE=
FB_PROJECT_ID=
FB_PRIVATE_KEY_ID=
FB_PRIVATE_KEY=
FB_CLIENT_EMAIL=
FB_CLIENT_ID=
FB_AUTH_URI=
FB_TOKEN_URI=
FB_AUTH_PROVIDER_CERT_URL=
FB_CLIENT_CERT_URL=
```

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/ahmed-1430/LifeLink-Backend
```

### Navigate to Project

```bash
cd blood-donation-server
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

---

##  API Security

The server uses:

- JWT Token Verification
- Role-Based Authorization
- Firebase Admin Verification
- Protected Private Routes
- Environment Variable Security

---

##  Main API Routes

### Auth Routes
```bash
POST   /jwt
```

### User Routes
```bash
GET    /users
GET    /users/:id
PATCH  /users/:id
```

### Donation Request Routes
```bash
GET    /donation-requests
POST   /donation-requests
PATCH  /donation-requests/:id
DELETE /donation-requests/:id
```

### Funding Routes
```bash
POST   /create-payment-intent
POST   /fundings
GET    /fundings
```

---

##  Database Collections

- users
- donationRequests
- fundings

---

##  Future Improvements

- Email Notifications
- SMS Alerts
- Real-Time Updates
- Analytics Dashboard
- Audit Logs

---

## Developer

Developed by Ahmed

---

## License

This project is licensed for educational and portfolio purposes.