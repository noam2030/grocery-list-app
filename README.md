# Grocery List App (FreshCart) 🛒

A modern, responsive, full-stack grocery shopping and inventory management application designed for mobile-first in-store shopping and desktop meal planning.

- **Frontend Deployment**: [Vercel](https://vercel.com) (Project: `grocery-list-app-ui`, Team: `noam-projects2`)
- **Backend Deployment**: [Google Cloud Run](https://cloud.google.com/run) (Service: `grocery-list-app-api`, Project: `ai-learning-499409`, Region: `us-central1`)
- **Persistence**: [Google Cloud Firestore](https://cloud.google.com/firestore) (Collection: `grocery-list-app`) with graceful local in-memory fallback

---

## Features

- **Multi-List Management**: Create, rename, switch, and delete shopping lists (e.g. "Weekly Groceries", "Costco Run", "Party Supplies"). Auto-seeds default list if empty.
- **Smart Item Entry**: Rapid item creation with quantity steppers (`+` / `-`), units (`pcs`, `kg`, `pack`, etc.), priority (`low`, `medium`, `high`), and keyword-based category auto-detection (e.g. typing "Apples" auto-suggests "Produce").
- **Aisle & Supermarket Organization**: 10 default department categories with color badges. Easily toggle between **Grouped Aisle View** (organized by department) and **Flat List View**.
- **Real-Time Search & Filters**: Instant search across item names and notes, with status tabs (`All`, `Active`, `Completed`) and horizontal department chips.
- **Progress Tracking & Batch Cleanup**: Live counter and progress bar showing completed items. One-click "Clear Completed" button.
- **Default Dark Theme & Optimistic UI**: The default view is Dark Theme, optimized for low-glare supermarket aisles and OLED battery conservation, with zero-flash pre-seeding in HTML and seamless manual toggle to Light mode; instant tap response with optimistic cache updates.
- **Robust Cloud Persistence**: Stores lists and items in Google Cloud Firestore using Application Default Credentials (ADC) on Cloud Run, with an in-memory fallback for local offline testing.

---

## Project Structure

```text
grocery-list-app/
├── SPEC.md                           # Authoritative 12-section specification
├── README.md                         # Project documentation
├── prompt.txt                        # Master specification & user prompt history
├── package.json                      # Root workspace scripts
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml        # Cloud Run source deployment workflow
│       └── deploy-frontend.yml       # Vercel deployment workflow
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                # Validated environment configuration (Zod)
│   │   │   └── firestore.ts          # Firestore client with in-memory fallback
│   │   ├── controllers/
│   │   │   ├── items.controller.ts   # Item CRUD & batch actions
│   │   │   └── lists.controller.ts   # List CRUD & cascading delete
│   │   ├── models/
│   │   │   └── schema.ts             # Zod validation schemas & TypeScript types
│   │   ├── routes/
│   │   │   ├── health.routes.ts      # /health & /api/health
│   │   │   ├── items.routes.ts       # /api/items routes
│   │   │   └── lists.routes.ts       # /api/lists routes
│   │   ├── middlewares/
│   │   │   ├── cors.ts               # Permissive CORS for Vercel & localhost
│   │   │   └── errorHandler.ts       # Uniform error formatting
│   │   ├── app.ts                    # Express application factory
│   │   └── server.ts                 # HTTP server entrypoint (0.0.0.0:$PORT)
│   ├── tests/
│   │   ├── items.test.ts             # Item endpoint unit & integration tests
│   │   └── lists.test.ts             # List endpoint unit & integration tests
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── vite-env.d.ts         # Vite client type definitions & ImportMeta typing
│   │   ├── api/
│   │   │   └── client.ts             # Fetch API client for backend
│   │   ├── components/
│   │   │   ├── AddItemForm.tsx       # Smart item creation form
│   │   │   ├── BatchActionsBar.tsx   # Progress bar & clear completed
│   │   │   ├── CategoryBadge.tsx     # Color-coded aisle badges
│   │   │   ├── DiagnosticBanner.tsx  # API connection & HTML error diagnostic banner
│   │   │   ├── EmptyState.tsx        # Contextual empty state illustrations
│   │   │   ├── FilterBar.tsx         # Search, status tabs & category pills
│   │   │   ├── GroceryItemCard.tsx   # Item card with quantity stepper
│   │   │   ├── Header.tsx            # App bar, list dropdown & dark mode
│   │   │   └── ListSelectorModal.tsx # Multi-list modal manager
│   │   ├── hooks/
│   │   │   ├── useGroceryList.ts     # State management & optimistic updates
│   │   │   └── useTheme.ts           # Dark theme default & toggle hook
│   │   ├── types/
│   │   │   └── index.ts              # Data contracts & category definitions
│   │   ├── App.tsx                   # Main layout & view switching
│   │   ├── index.css                 # Tailwind directives & smooth scrolling
│   │   └── main.tsx                  # React DOM root
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json                   # Vercel SPA routing
│   └── vite.config.ts
└── tests/
    └── test_grocery_list_app.py      # Automated contract & compliance test suite
```

---

## Data Model & Firestore Structure

Data resides in **Google Cloud Firestore** (project `ai-learning-499409`, database `(default)`).

### Collections:
1. **`grocery-list-app_lists`**:
   ```json
   {
     "id": "list_weekly_groceries",
     "name": "Weekly Groceries",
     "description": "Standard household essentials",
     "isDefault": true,
     "createdAt": "2026-10-11T12:00:00.000Z",
     "updatedAt": "2026-10-11T12:00:00.000Z"
   }
   ```
2. **`grocery-list-app_items`**:
   ```json
   {
     "id": "item_9b1deb4d",
     "listId": "list_weekly_groceries",
     "name": "Organic Whole Milk",
     "quantity": 2,
     "unit": "gallons",
     "category": "Dairy & Eggs",
     "priority": "high",
     "notes": "Check expiration date",
     "isCompleted": false,
     "createdAt": "2026-10-11T12:05:00.000Z",
     "updatedAt": "2026-10-11T12:05:00.000Z"
   }
   ```

*Offline fallback: When running without Google Cloud credentials, the backend automatically uses a memory store pre-seeded with sample data.*

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health`, `/api/health` | Health check endpoint returning service status |
| `GET` | `/api/lists` | Returns all lists with item counts (auto-seeds if empty) |
| `POST` | `/api/lists` | Create a new shopping list (`{ "name": string, "description"?: string }`) |
| `GET` | `/api/lists/:listId` | Get single list details |
| `PATCH` | `/api/lists/:listId` | Update list name or description |
| `DELETE` | `/api/lists/:listId` | Delete list and cascade delete all its items |
| `GET` | `/api/items` | Query items (`listId`, `category`, `isCompleted`, `search`, `sort`) |
| `POST` | `/api/items` | Add a new grocery item |
| `GET` | `/api/items/:id` | Get single item details |
| `PATCH` | `/api/items/:id` | Partial update (toggle `isCompleted`, update `quantity`, etc.) |
| `DELETE` | `/api/items/:id` | Delete an item |
| `POST` | `/api/items/clear-completed` | Batch remove all completed items in a list (`{ "listId": string }`) |

---

## Configuration & Environment Variables

### Backend (`backend/.env`):
```ini
PORT=8080
NODE_ENV=production
GCP_PROJECT_ID=ai-learning-499409
FIRESTORE_COLLECTION=grocery-list-app
CORS_ORIGIN=*
```

### Frontend (`frontend/.env`, `frontend/.env.production`):
```ini
VITE_API_URL=https://grocery-list-app-api-bdxnar4rza-uc.a.run.app
```

---

## Running Locally

### Backend:
```bash
cd backend
npm install
npm run dev
```
The API starts at `http://localhost:8080`.

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
The UI starts at `http://localhost:3000`.

### Running Automated Tests:
```bash
# Contract & Specification tests:
python3 -m unittest discover tests

# Backend tests:
npm run test --workspace=backend
```

---

## Deployment Instructions

### 1. Backend to Google Cloud Run:
The backend deploys directly from source code to Google Cloud Run:
```bash
cd backend
gcloud run deploy grocery-list-app-api \
  --source . \
  --project ai-learning-499409 \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --quiet \
  --set-env-vars "GCP_PROJECT_ID=ai-learning-499409,FIRESTORE_COLLECTION=grocery-list-app,NODE_ENV=production,CORS_ORIGIN=*"
```
*Note: Cloud Run injects `$PORT` automatically; `--port 8080` specifies the container port. `PORT` is never passed to `--set-env-vars`. `--quiet` ensures non-interactive headless execution in CI.*

### 2. Frontend to Vercel:
The frontend deploys to Vercel targeting project `grocery-list-app-ui` (configured in `frontend/vercel.json` and `frontend/package.json`) under scope `noam-projects2`:
```bash
cd frontend
vercel deploy --prod --scope noam-projects2 --token $VERCEL_TOKEN --yes
```

### CI/CD Deployment Troubleshooting & Fixes:
1. **Vercel CLI `--project` Option Failure**: `vercel deploy` does not accept `--project` (which triggers `error: unknown option '--project'`). Project identity is determined by `"name": "grocery-list-app-ui"` defined in `frontend/vercel.json` and `frontend/package.json`.
2. **Multiple Jest Configurations Conflict**: Jest fails when discovering multiple configs (`backend/jest.config.js` and `"jest"` key in `backend/package.json`). Centralized configuration exclusively in standalone `backend/jest.config.js` with `ts-jest` preset and explicit `--config jest.config.js` in `package.json`, completely removing the inline `"jest"` block to prevent ambiguous implicit resolution.
3. **Cloud Run Headless Prompting**: Added `--quiet` to `gcloud run deploy` to prevent blocking on unhandled standard input in GitHub Actions runners.
4. **GitHub Actions `npm ci` Failures**: Standardized on `npm install` across workflows to support environments without committed lockfiles.
5. **Missing Vercel Org/Project ID Secrets**: Eliminated `vercel pull` and replaced with direct non-interactive `vercel deploy --prod --scope noam-projects2 --token ${{ secrets.VERCEL_TOKEN }} --yes`.
6. **Cloud Run Buildpack Compilation**: Placed `typescript` in `dependencies` in `backend/package.json`, added `"gcp-build": "tsc"`, and provided a multi-stage `Dockerfile` and `.gcloudignore` for resilient source builds.
7. **Vercel Build ImportMeta TS2339**: Created `frontend/src/vite-env.d.ts` and configured `frontend/tsconfig.json` with `types: ["vite/client"]` and hardened environment resolution in `frontend/src/api/client.ts`.
8. **Frontend HTML Doctype Parsing Defense (`Unexpected token '<', "<!doctype "... is not valid JSON`)**:
   - *Problem*: In deployed SPAs (e.g., Vercel) or local development where `VITE_API_URL` is empty or unconfigured, fetch calls requesting relative endpoints (`/api/...`) match Vercel's catch-all SPA rewrite rule (`/(.*) -> /index.html`). Vercel returns `index.html` (which starts with `<!doctype html>`) with HTTP status 200. Calling `response.json()` causes an uncaught syntax exception.
   - *Resolution*:
     - Hardened `frontend/src/api/client.ts` to inspect `Content-Type` and body text before parsing JSON, detecting `<!doctype` and `text/html` responses and raising descriptive errors instead of crashing.
     - Added `DiagnosticBanner.tsx` allowing users to configure the backend API URL dynamically at runtime (persisted in `localStorage.setItem('freshcart_api_url', ...)`), run health checks, or switch seamlessly into offline Demo Mode.
     - Configured `/api` proxy in `frontend/vite.config.ts` to forward calls to `http://localhost:8080` during local development.
     - Added 404 JSON catch-all in `backend/src/app.ts` ensuring unmatched backend endpoints always return JSON rather than Express default HTML pages.



