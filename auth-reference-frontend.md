# Authentication Reference For Frontend Migration

This guide documents how authentication is implemented in the current Vite React app and how the same behavior should be carried into a future Next.js frontend.

## Current Auth Model

The app uses Firebase Authentication for identity and the Dining Management backend for application profiles, roles, and permissions.

There is no custom frontend session cookie in the current implementation. The browser signs in directly with Firebase, Firebase persists the session internally, and the frontend sends a Firebase ID token to the backend on protected API calls.

High-level flow:

1. Firebase initializes in `firebase/firebase.init.js`.
2. `AuthProvider` subscribes to Firebase auth state with `onAuthStateChanged`.
3. Components read `user`, `loading`, and auth actions through `useAuth`.
4. Protected UI waits for auth loading to finish.
5. Authenticated API requests call `user.getIdToken()` and attach it as a bearer token.
6. The backend verifies the token on protected routes and uses token identity, especially email, to resolve the current app user.
7. The app role is fetched separately from `/users/get-role/:email`.

## Firebase Initialization

Current file: `firebase/firebase.init.js`

The frontend initializes Firebase with Vite environment variables:

```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};
```

Then it exports:

```js
export const auth = getAuth(app);
```

For Next.js, move this into a client-safe module such as `lib/firebase/client.ts`. Use `NEXT_PUBLIC_` environment variables instead of `VITE_` variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Only expose Firebase client config values with `NEXT_PUBLIC_`. Do not expose Firebase Admin SDK credentials to the browser.

## Auth Provider

Current files:

- `src/auth/AuthContext.jsx`
- `src/auth/AuthProvider.jsx`
- `src/hooks/useAuth.js`

`AuthProvider` is the central client-side auth state holder. It stores:

- `user`: the current Firebase user, or no user when logged out
- `loading`: true until Firebase finishes checking the persisted auth session
- `errorMessage`: shared auth error text, currently only stored and exposed

It exposes these actions:

- `createUser(email, password)` -> Firebase `createUserWithEmailAndPassword`
- `signInUser(email, password)` -> Firebase `signInWithEmailAndPassword`
- `resetPasswordByEmail(email)` -> Firebase `sendPasswordResetEmail`
- `signOutUser()` -> Firebase `signOut`
- `updateUserProfile(name, image)` -> Firebase `updateProfile`

The important behavior is the `onAuthStateChanged` subscription:

```js
onAuthStateChanged(auth, async (currentUser) => {
  setUser(currentUser);
  setLoading(false);
  setErrorMessage('');
});
```

In Next.js App Router, this provider must be a client component and should be mounted from a root providers component:

```tsx
// app/providers.tsx
'use client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
```

Any component that reads Firebase user state directly must also be a client component.

## Sign In

Current file: `src/pages/Login.jsx`

Login uses `react-hook-form` and calls:

```js
await signInUser(data.email, data.password);
navigate('/');
```

The sign-in method delegates directly to Firebase:

```js
signInWithEmailAndPassword(auth, email, password);
```

After login, Firebase updates auth state. `AuthProvider` receives the user through `onAuthStateChanged`, and the rest of the app reacts to the new `user` value.

For Next.js:

- keep the login page as a client component
- call Firebase client auth directly from the browser
- after success, use `router.push('/')`
- do not manually store the ID token in localStorage

## Registration

Current file: `src/pages/Registration.jsx`

Registration has two separate steps:

1. Create the Firebase auth account:

```js
await createUser(data.email, data.password);
```

2. Create the Dining Management app profile:

```js
await registerUser(axiosSecure, {
  name: data.name,
  building: data.building,
  room: data.room,
  email: data.email,
  mobile: data.mobile,
  bank: data.bank,
});
```

`registerUser` posts to:

```http
POST /users/create
```

Current app profile fields collected by the registration form:

- `name`
- `building`
- `room`
- `mobile`
- `email`
- `bank`
- `password`, used only for Firebase account creation

Important migration note: Firebase user creation and app profile creation are not currently transactional. If Firebase account creation succeeds but `/users/create` fails, the auth account may exist without a matching app user profile. A Next.js migration can preserve current behavior, but a production-hardening pass should add recovery handling for this split state.

## Logout

Current file: `src/components/Navbar.jsx`

The navbar reads `signOutUser` from `useAuth` and calls:

```js
await signOutUser();
toast.success('Logged out successfully');
```

`signOutUser` delegates to Firebase:

```js
signOut(auth);
```

Firebase then emits a null user through `onAuthStateChanged`, which causes private routes and authenticated UI to update.

For Next.js, logout remains a client-side action if the app keeps Firebase client auth only. If a future version also introduces session cookies, logout must clear both Firebase client state and the server cookie.

## Password Reset And Recovery

Current file: `src/pages/Login.jsx`

The app supports two reset flows.

### Firebase Email Reset

The user enters an email on the login form and clicks "Email Password Reset".

Frontend call:

```js
resetPasswordByEmail(email);
```

Firebase sends the password reset email through:

```js
sendPasswordResetEmail(auth, email);
```

### Admin-Assisted Recovery

The user can switch to recovery mode and submit:

```json
{
  "email": "member@example.com",
  "recoveryCode": "ABCD-2345-WXYZ",
  "newPassword": "new-password"
}
```

Frontend request:

```http
POST /auth/recover-password
```

This route does not require the user to already be signed in. An admin-generated recovery code is required.

Super admins can create recovery codes from member management:

```http
POST /auth/admin/create-recovery-code
```

Request body:

```json
{
  "userId": "user-id"
}
```

Only `super_admin` users should see or use this flow in the frontend. Current UI checks this with `isSuperAdminRole(role)`.

## Authenticated API Client

Current file: `src/hooks/useAxiosSecure.js`

The shared Axios instance uses this base URL:

```js
baseURL: 'https://dining-management-server.vercel.app'
```

The local development URL is present but commented:

```js
// baseURL: 'http://localhost:5000'
```

On every request, the hook attaches a Firebase ID token if a user exists:

```js
const token = await user.getIdToken();
config.headers.Authorization = `Bearer ${token}`;
```

The backend expects:

```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

Next.js options:

1. Preserve the current client-only model with an Axios or `fetch` wrapper used from client components.
2. Introduce server sessions or cookies and route protected calls through server components, route handlers, or server actions.

The simplest migration is option 1 because the current UI already depends heavily on client-side Firebase auth, React Query, and interactive dashboard state.

Recommended client fetch helper shape:

```ts
export async function authFetch(input: string, init: RequestInit = {}) {
  const user = auth.currentUser;
  const headers = new Headers(init.headers);

  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('Content-Type', 'application/json');

  return fetch(`${API_BASE_URL}${input}`, {
    ...init,
    headers,
  });
}
```

If using Axios, keep the interceptor registration inside a client hook or module that has access to the current Firebase user.

## Route Protection

Current files:

- `src/components/PrivateRoute.jsx`
- `src/components/AdminRoute.jsx`
- `src/router/routes.jsx`

### Private Routes

`PrivateRoute` reads:

```js
const { user, loading } = useAuth();
```

Behavior:

- while `loading` is true, render `<Loading />`
- when loading is false and no user exists, redirect to `/login`
- otherwise render children

Current protected user routes:

- `/user-dashboard`
- `/user-dashboard/meal-sheet`
- `/user-dashboard/financial-information`
- `/user-dashboard/profile`
- `/user-profile`

Current protected admin routes:

- `/admin-dashboard`
- `/admin-dashboard/meal-schedule`
- `/admin-dashboard/fund-management`
- `/admin-dashboard/member-management`
- `/admin-dashboard/history`

### Admin Routes

`AdminRoute` fetches the current app role with `useRole()` and allows access only when:

```js
isAdminRole(role)
```

Current admin roles:

```js
export const ADMIN_ROLES = ['admin', 'super_admin'];
```

If the role is not an admin role, the user is redirected to:

```text
/user-dashboard
```

For Next.js client-side Firebase auth, create client guard wrappers:

- `RequireAuth`
- `RequireAdmin`

Use them in page or layout components for protected areas. If server sessions are added later, move redirects into server layouts with `redirect()`.

## Role Resolution

Current files:

- `src/hooks/useRole.js`
- `src/utils/roles.js`

Roles are not read from Firebase custom claims in the current frontend. The role is loaded from the backend by email:

```http
GET /users/get-role/:email
```

The React Query key is:

```js
['user-role', user?.email]
```

The query is enabled only when the Firebase user has an email:

```js
enabled: !!user?.email
```

Default role in the hook is:

```js
member
```

Current role helpers:

```js
export const ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];
```

Backend API documentation lists additional role values that may exist:

- `admin`
- `manager`
- `member`
- `moderator`
- `staff`
- `super_admin`

Current frontend admin access only treats `admin` and `super_admin` as admin roles. If `manager`, `moderator`, or `staff` should access admin pages in the Next.js version, update the role helper deliberately instead of assuming all backend roles are admin-equivalent.

## Navbar Auth Behavior

Current file: `src/components/Navbar.jsx`

Navbar behavior:

- while auth is loading, show a skeleton
- when logged out, show a `/login` button
- when logged in, show the Firebase user email and avatar/dropdown
- if the fetched app role is admin, show the manager dashboard link
- always show the user dashboard link for authenticated users
- logout signs out of Firebase

The displayed identity comes from Firebase:

- `user.email`
- `user.photoURL`

The dashboard access decision comes from the backend role lookup, not Firebase.

## Backend Contract

Protected backend routes expect a Firebase ID token:

```http
Authorization: Bearer <firebase_id_token>
```

Important auth-related endpoints:

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/users/create` | Public in current docs | Create Dining Management user profile after Firebase signup. |
| `GET` | `/users/profile` | Authenticated | Get current user's profile based on token email. |
| `PUT` | `/users/profile` | Authenticated | Update current user's profile. |
| `GET` | `/users/get-role/:email` | Public in current docs | Get active user's role by email. |
| `GET` | `/users/check-user/:email` | Public in current docs | Check whether an active user exists. |
| `PUT` | `/users/role/:userId` | Admin-level | Update a user's role. |
| `POST` | `/auth/admin/create-recovery-code` | `super_admin` | Create a temporary recovery code. |
| `POST` | `/auth/recover-password` | Public | Reset password with a recovery code. |

Use `backend-reference.md` as the broader API contract.

## Next.js Implementation Checklist

1. Create `lib/firebase/client.ts` with Firebase client initialization.
2. Create `components/providers/auth-provider.tsx` or `lib/auth/auth-provider.tsx` as a client component.
3. Mount `AuthProvider` inside `app/providers.tsx`.
4. Keep React Query in the provider stack if dashboard data continues to use client queries.
5. Create `useAuth()` for client components.
6. Create `useRole()` using React Query and `/users/get-role/:email`.
7. Create `authFetch` or `useAxiosSecure()` that adds `Authorization: Bearer <token>`.
8. Port `/login` as a client page using Firebase `signInWithEmailAndPassword`.
9. Port `/register` as a client page that first creates the Firebase user, then posts `/users/create`.
10. Add `RequireAuth` for user dashboard pages.
11. Add `RequireAdmin` for admin dashboard pages.
12. Keep password reset and admin-assisted recovery flows on the login/member-management pages.

## Migration Cautions

- Do not read Firebase auth state from a Server Component unless the app introduces a server session strategy.
- Do not store Firebase ID tokens in localStorage. Ask Firebase for the current ID token when making requests.
- Do not assume a Firebase user has an app profile. Registration currently creates these in two separate calls.
- Do not assume Firebase user identity implies admin access. Admin access comes from the backend role lookup.
- Do not expose Firebase Admin SDK credentials in `NEXT_PUBLIC_` environment variables.
- Be careful with route protection during initial loading. Redirecting before Firebase finishes loading will incorrectly send valid users to `/login`.
- Current role protection is mostly frontend navigation plus backend authorization. The Next.js frontend should still hide unauthorized UI, but backend checks remain the source of enforcement for protected mutations.

