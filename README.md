# Dining Management Frontend

The frontend for a web-based dining management system. It helps members register for meals and view their dining finances, while administrators manage schedules, members, deposits, expenses, and monthly accounts.

This application is built with React and Vite and communicates with the companion [Express/MongoDB backend](https://github.com/sami157/dining-management-server).

## Features

### Members

- Firebase email/password authentication
- Meal schedule and meal registration management
- Bulk meal registration for a month
- Meal quantity updates, cancellations, and comments
- Default meal preferences
- Upcoming meal overview
- Profile management
- Meal totals, deposits, balances, and finalized financial information

### Administrators

- Weekly meal schedule generation and editing
- Meal availability, menus, weights, holidays, and deadlines
- Member search and management
- Role, fixed deposit, and mosque fee management
- Late meal registration and cancellation on behalf of members
- Deposit and expense management
- Meal-rate and monthly financial finalization
- Historical finalized-month data

## Technology

- React 19
- Vite
- React Router
- TanStack React Query
- Firebase Authentication
- Axios
- Tailwind CSS and daisyUI
- React Hook Form
- Recharts
- Motion and Lottie animations

## Project structure

```text
src/
├── auth/          Firebase authentication context and provider
├── components/    Shared UI and dashboard components
├── hooks/         Authentication, role, and API hooks
├── layouts/       Public, member dashboard, and admin dashboard layouts
├── pages/         Application screens
├── router/        React Router configuration
└── utils/         Roles, meal types, registration, and user helpers
```

The application entry point is `src/main.jsx`. It wraps the router with `QueryClientProvider` and `AuthProvider`.

## Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/login`, `/register` |
| Member dashboard | `/user-dashboard`, `/user-dashboard/meal-sheet`, `/user-dashboard/comments`, `/user-dashboard/financial-information`, `/user-dashboard/profile` |
| Admin dashboard | `/admin-dashboard/meal-schedule`, `/admin-dashboard/fund-management`, `/admin-dashboard/member-management`, `/admin-dashboard/history` |

Member routes require authentication. Admin routes additionally require an administrative role returned by the backend.

## Prerequisites

- Node.js 18 or newer
- npm
- A running instance of the dining-management backend
- A Firebase project with Email/Password authentication enabled

## Getting started

From this directory:

```bash
npm install
npm run dev
```

Vite will start the development server and print the local URL in the terminal.

The backend normally runs at `http://localhost:5000`. API requests are currently configured in `src/hooks/useAxiosSecure.js` with that local base URL.

## Environment variables

Create a `.env.local` file in this directory with the Firebase web-app configuration:

```env
VITE_apiKey=your-firebase-api-key
VITE_authDomain=your-firebase-auth-domain
VITE_projectId=your-firebase-project-id
VITE_storageBucket=your-firebase-storage-bucket
VITE_messagingSenderId=your-firebase-messaging-sender-id
VITE_appId=your-firebase-app-id
```

Firebase values are read in `firebase/firebase.init.js`. Do not commit `.env.local` or other environment files.

`VITE_API_URL` may be defined locally, but the current Axios hook does not read it yet; the API URL is still hardcoded to `http://localhost:5000`.

## Available scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Authentication and API requests

`AuthProvider` listens for Firebase auth state changes and exposes the current user through the application context. `useAxiosSecure` attaches the current Firebase ID token as a Bearer token to authenticated API requests.

The backend expects requests in this form:

```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

For the backend endpoint list and request formats, see [backend-reference.md](./backend-reference.md).

## Deployment

The project includes a `vercel.json` rewrite so client-side routes resolve to `index.html` when deployed to Vercel. Before deploying to production, configure the production API URL in the Axios hook and provide the Firebase environment variables in the hosting provider.

## Related project

The companion [backend repository](https://github.com/sami157/dining-management-server) provides the Express API, Firebase token verification, MongoDB persistence, role-based authorization, and financial calculations.
