# Unfazed — Practice Management SaaS

This directory contains the separate frontend and backend applications as specified in Section 3 of the project details:

```
unfazed/
├── unfazed-backend/   # Node.js + Express API + Sockets + Entitlements
│   ├── src/
│   │   ├── config/    # DB & Razorpay initializers
│   │   ├── models/    # Mongoose schemas
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/  # Entitlement, Notifications, Invoices
│   │   └── sockets/   # Socket.io chat
│   ├── server.js      # Backend entry point
│   ├── render.yaml    # 1-click Render backend deployment
│   └── package.json
│
└── unfazed-frontend/  # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/     # Therapist Hub & Client Portal
    │   ├── context/
    │   └── services/
    ├── vercel.json    # 1-click Vercel frontend deployment
    └── package.json
```

## Running Backend:
```bash
cd unfazed-backend
npm install
npm run dev
```

## Running Frontend:
```bash
cd unfazed-frontend
npm install
npm run dev
```
