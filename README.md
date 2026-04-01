# TaskManager

A project management app built for keeping vendor management, contract management, and project management organized. Built with Nuxt 4, Vuetify 4, Firebase, and hosted on Cloudflare Pages.

## Features

- **Dashboard** — See all active projects, open tasks, and daily stats at a glance
- **Projects** — Create and manage projects with categories (vendor, contract, project, other)
- **Notes** — Add timestamped notes with types: note, update, insight, decision, risk. Pin important notes.
- **Tasks** — Create tasks with priority levels (urgent, high, medium, low). Mark in-progress or done.
- **Daily Summary** — End-of-day view with open tasks, completed tasks, and per-project summaries
- **Auth** — Email/password and Google sign-in via Firebase Auth
- **Dark/Light mode** toggle

## Prerequisites

- Node.js 18+
- A Firebase project with Firestore and Authentication enabled
- A Cloudflare account (for deployment)

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** > Sign-in methods > Enable **Email/Password** and **Google**
3. Enable **Cloud Firestore** > Create database (start in test mode or configure rules below)
4. Go to **Project Settings** > **General** > **Your apps** > Add a **Web app**
5. Copy the Firebase config values

### Firestore Security Rules

In Firebase Console > Firestore > Rules, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Firestore Indexes

The app uses composite queries. Create these indexes in Firebase Console > Firestore > Indexes:

| Collection | Fields | Order |
|---|---|---|
| projects | userId (Asc), updatedAt (Desc) | |
| notes | projectId (Asc), userId (Asc), createdAt (Desc) | |
| tasks | userId (Asc), createdAt (Desc) | |
| tasks | projectId (Asc), userId (Asc), createdAt (Desc) | |
| notes | userId (Asc), createdAt (Desc) | |

> Tip: If you skip this step, Firebase will log errors in the browser console with direct links to create the required indexes automatically.

## Local Development

1. Clone the repo:
   ```bash
   git clone <your-gitlab-repo-url>
   cd task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Fill in your Firebase config values in `.env`

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Cloudflare Pages

### Option 1: GitLab Integration (Recommended)

1. Push your code to GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > Pages > Create a project
3. Connect your GitLab account and select the repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
5. Add environment variables (same as your `.env` values)
6. Deploy

Every push to `main` will trigger an automatic deployment.

### Option 2: Direct Deploy via Wrangler

```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

### Environment Variables on Cloudflare

In Cloudflare Pages > your project > Settings > Environment variables, add:

| Variable | Value |
|---|---|
| `NUXT_PUBLIC_FIREBASE_API_KEY` | your-api-key |
| `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com |
| `NUXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id |
| `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com |
| `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | your-sender-id |
| `NUXT_PUBLIC_FIREBASE_APP_ID` | your-app-id |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run generate` | Generate static site |
