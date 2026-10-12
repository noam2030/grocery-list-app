# Specification: grocery-list-app

Authoritative system architecture and design specification for **grocery-list-app**.

---

## 1. Overview
`grocery-list-app` is a responsive, fast, intuitive full-stack grocery shopping and inventory management application designed for mobile-first in-store shopping and desktop meal planning.

### Target Users
- Individual and household shoppers organizing routine grocery trips.
- Families and roommates coordinating shared shopping lists.
- Shoppers navigating supermarket aisles with one-handed mobile interactions.

### Core Value Proposition
- Instant grocery item entry with category auto-suggestion.
- Multi-list support (e.g., "Weekly Groceries", "Costco Run", "Dinner Party") with auto-seeding.
- Aisle/category grouping to streamline physical store navigation.
- High reliability with Google Cloud Firestore persistence and seamless local in-memory fallback for offline development.
- Strikethrough completion toggling with batch cleanup of checked-off items.
- Modern, accessible UI supporting both Light and Dark modes.

---

## 2. Requirements

### Functional Requirements
1. **List Management**:
   - Create new shopping lists with custom names and descriptions.
   - View all existing lists with real-time item counts (active and completed).
   - Auto-seed a default "Weekly Groceries" list if no lists exist.
   - Switch active lists instantly.
   - Delete lists with cascading deletion of all associated items.
2. **Item Management**:
   - Add items specifying name, quantity, unit (pcs, kg, lbs, pack, bunch, etc.), category, priority (low, medium, high), and optional notes.
   - Real-time inline toggle of item completion (`isCompleted`) with visual strikethrough.
   - Quick quantity steppers (`+` and `-`) for rapid adjustments while walking aisles.
   - Update any item details (name, quantity, unit, category, priority, notes).
   - Delete single items or batch-clear all completed items from the active list.
3. **Categorization & Supermarket Aisle Organization**:
   - 10 standard categories: Produce, Dairy & Eggs, Bakery, Meat & Seafood, Pantry, Frozen, Beverages, Household, Snacks, Other.
   - Category color badge tokens and icons.
   - Grouped Aisle View to display items partitioned by supermarket department.
   - Smart keyword categorization inference during input (e.g., "Bananas" suggests "Produce", "Milk" suggests "Dairy & Eggs").
4. **Search & Filtering**:
   - Real-time text search across item names and notes.
   - Status filters: All, Active, Completed.
   - Category filter pills.
   - Sorting options: By Aisle/Category, Alphabetical (A-Z), Priority (High to Low), Recently Added.

### Non-Functional Requirements
1. **Performance**: Sub-150ms backend response times for list and item CRUD operations; sub-16ms frontend UI rendering response.
2. **Availability & Resilience**: Fully stateless backend deployable to Google Cloud Run; persistent storage in Google Cloud Firestore with zero local SQLite dependencies. In-memory fallback enables running offline without cloud credentials.
3. **Usability & Accessibility**: Mobile-first responsive layout with tap targets $\ge 44 \times 44\text{ px}$. Full keyboard accessibility and WCAG AA color contrast ratios.
4. **Reliability**: 100% test coverage for API endpoints, validation schemas, and state updates.

---

## 3. User Experience

### Design System & Theme
- **Color Palette**:
  - Primary Accent: Fresh Emerald (`#059669` / `bg-emerald-600`) symbolizing fresh groceries.
  - Neutral Background: Light (`#f8fafc` / `slate-50`), Dark (`#0f172a` / `slate-900`).
  - Cards & Surfaces: Light (`#ffffff` / `bg-white`), Dark (`#1e293b` / `slate-800`).
  - Category Badge Colors:
    - Produce: Green (`bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`)
    - Dairy & Eggs: Amber/Yellow (`bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300`)
    - Bakery: Orange (`bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300`)
    - Meat & Seafood: Rose/Red (`bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300`)
    - Pantry: Brown/Warm Gray (`bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300`)
    - Frozen: Cyan/Sky (`bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300`)
    - Beverages: Purple (`bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300`)
    - Household: Slate/Indigo (`bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300`)
    - Snacks: Pink (`bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300`)
    - Other: Zinc (`bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300`)

### Key User Flows
1. **Selecting / Creating a List**:
   - Shopper opens the app. The active list defaults to "Weekly Groceries".
   - The user can tap the list header dropdown to switch to another list or tap "New List" to create one.
2. **Adding an Item**:
   - Shopper types an item name in the quick-add bar.
   - The category selector automatically auto-selects based on matching keywords (e.g. typing "Apples" selects "Produce").
   - Shopper can adjust quantity with `+` / `-` steppers, pick a unit, and press Enter or tap "Add Item".
3. **Shopping in Store**:
   - Shopper selects "Aisle View" to view items grouped by category.
   - Tapping an item checkbox immediately strikes through the item and marks it complete with optimistic feedback.
   - Counter at bottom updates in real-time: "3 of 10 items completed".
   - When done, user can tap "Clear Completed" to purge checked items.

---

## 4. Architecture

### System Architecture Diagram
```
┌────────────────────────────────────────────────────────┐
│             Frontend (Vercel: grocery-list-app-ui)     │
│   React 18 + TypeScript + Vite + Tailwind CSS          │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON REST API
                           ▼
┌────────────────────────────────────────────────────────┐
│         Backend (Google Cloud Run: grocery-list-app-api)│
│   Node.js 20 + Express + Zod + @google-cloud/firestore │
│   Port: $PORT (8080)                                   │
└──────────────────────────┬─────────────────────────────┘
                           │ Google Cloud ADC (Service Account)
                           ▼
┌────────────────────────────────────────────────────────┐
│     Google Cloud Firestore (ai-learning-499409)        │
│     Collection: 'grocery-list-app'                     │
│     (Subcollections: lists, items)                     │
│     * Graceful fallback: In-Memory Store if offline    │
└────────────────────────────────────────────────────────┘
```

### Directory Layout
```text
grocery-list-app/
├── SPEC.md
├── README.md
├── prompt.txt
├── package.json
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml
│       └── deploy-frontend.yml
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── firestore.ts
│   │   ├── controllers/
│   │   │   ├── items.controller.ts
│   │   │   └── lists.controller.ts
│   │   ├── models/
│   │   │   └── schema.ts
│   │   ├── routes/
│   │   │   ├── health.routes.ts
│   │   │   ├── items.routes.ts
│   │   │   └── lists.routes.ts
│   │   ├── middlewares/
│   │   │   ├── cors.ts
│   │   │   └── errorHandler.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── items.test.ts
│   │   └── lists.test.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── components/
│   │   │   ├── AddItemForm.tsx
│   │   │   ├── BatchActionsBar.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── GroceryItemCard.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ListSelectorModal.tsx
│   │   ├── hooks/
│   │   │   └── useGroceryList.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json
│   └── vite.config.ts
└── tests/
    └── api_contract_test.py
```

---

## 5. Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.4+
- **Bundler**: Vite 5.2+
- **Styling**: Tailwind CSS 3.4+ with PostCSS and Autoprefixer
- **Icons**: Lucide React 0.378+
- **Deployment**: Vercel (`grocery-list-app-ui`, team: `noam-projects2`)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express 4.19+ with TypeScript
- **Validation**: Zod 3.23+ for request schemas and type inference
- **Database Client**: `@google-cloud/firestore` 7.7+
- **CORS**: `cors` 2.8+
- **Deployment**: Google Cloud Run (`grocery-list-app-api`, project: `ai-learning-499409`, region: `us-central1`)

### Testing
- Backend unit and route tests using Jest / Supertest.
- Automated API contract and mock validation test suite in `tests/`.

---

## 6. Backend

### Routing Architecture
- `health.routes.ts`: Serves `/health` and `/api/health`.
- `lists.routes.ts`:
  - `GET /api/lists`
  - `POST /api/lists`
  - `GET /api/lists/:listId`
  - `PATCH /api/lists/:listId`
  - `DELETE /api/lists/:listId`
- `items.routes.ts`:
  - `GET /api/items`
  - `POST /api/items`
  - `GET /api/items/:id`
  - `PATCH /api/items/:id`
  - `DELETE /api/items/:id`
  - `POST /api/items/clear-completed`

### Middleware
- `cors.ts`: Permissive CORS allowing cross-origin requests from Vercel deployments (`*` or configured origins) with credentials and header authorization.
- `express.json()`: Request payload parsing limited to 2MB.
- `404 JSON Catch-All Middleware`: Unmatched backend routes are intercepted prior to error handling to return `{ "error": { "code": "NOT_FOUND", "message": "Endpoint not found" } }` with explicit `Content-Type: application/json`, preventing Express from emitting default HTML error pages.
- `errorHandler.ts`: Standardized error payload formatting:
  ```json
  {
    "error": {
      "code": "BAD_REQUEST",
      "message": "Validation failed",
      "details": [...]
    }
  }
  ```

### Firestore Client & Mock Fallback
The `firestore.ts` module checks for Google Cloud environment or Application Default Credentials. When running locally without active GCP credentials, it switches seamlessly to a thread-safe in-memory store simulating Firestore collection semantics, ensuring automated tests and local runs execute reliably offline.

---

## 7. Frontend

### Component Structure
1. **`Header`**:
   - Branding with grocery icon.
   - List selector pill button with total/pending badges.
   - Quick "New List" trigger.
   - Live Backend Connection status pill (Green "Cloud Run API" badge when connected, Amber/Red when disconnected/HTML intercepted) with 1-click trigger to open `ConnectionModal`.
   - Dark/Light mode toggle button.
2. **`ConnectionModal`**:
   - Dedicated interactive backend connection modal allowing users to inspect, test, and switch API URLs at runtime.
   - Quick 1-click preset button for the live deployed Cloud Run API (`https://grocery-list-app-api-bdxnar4rza-uc.a.run.app`).
   - Live `/health` ping test verifying endpoint response, latency, and status.
   - Saves custom or reset URLs directly to `localStorage` (`grocery_api_url` and `freshcart_api_url`) and triggers instant data reload.
3. **`FilterBar`**:
   - Live search input with single-click clear button.
   - Status tabs: `All`, `Active`, `Completed`.
   - Category filter pills with counts.
   - View mode toggle: `Grouped by Aisle` vs `List View`.
   - Sort dropdown: Category, A-Z, Priority, Newest.
4. **`AddItemForm`**:
   - Item name input with instant category auto-detection.
   - Quantity input with quick `+` / `-` increment buttons.
   - Unit selection dropdown (`pcs`, `kg`, `lbs`, `oz`, `pack`, `box`, `bottle`, `bunch`, `can`).
   - Category picker with color dots.
   - Priority selector (`low`, `medium`, `high`).
   - Add button with keyboard shortcut (`Enter`).
5. **`GroceryItemCard`**:
   - Large touch checkbox.
   - Strike-through formatting when completed.
   - Quantity and unit badge.
   - Category badge with department color.
   - Priority indicator.
   - Quick `+` and `-` quantity steppers directly on card.
   - Delete button with confirmation toast.
6. **`BatchActionsBar`**:
   - Progress bar showing completed items vs total items.
   - "Clear Completed" button.
7. **`EmptyState`**:
   - Graphic and instructions when list is empty or search yields no matches.
8. **`ListSelectorModal`**:
   - Modal for listing, creating, switching, and deleting shopping lists.
9. **`DiagnosticBanner`**:
   - Visual status banner rendered when the backend returns HTML, when `VITE_API_URL` is unconfigured, or when connectivity issues arise.
   - Features 1-click "Connect to Cloud Run" button switching to `https://grocery-list-app-api-bdxnar4rza-uc.a.run.app`.
   - Provides an inline API configuration drawer allowing users to set a custom backend URL and test connectivity.
   - Includes a "Demo Mode" toggle that seamlessly falls back to local in-memory storage so users can explore and use the full application offline without JSON parsing crashes.

### Single-Page Application (SPA) Resilience & Routing
- `frontend/vercel.json` configures client-side rewrite rules to ensure refreshing any route serves `/index.html`:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### Direct Cloud Run Connection & HTML / Doctype Response Defense
- **Production Cloud Run Backend URL**:
  `https://grocery-list-app-api-bdxnar4rza-uc.a.run.app` (deployed in project `ai-learning-499409`, region `us-central1`).
- **Defensive API Client Implementation (`frontend/src/api/client.ts`)**:
  1. **Content-Type Inspection**: Inspects `response.headers.get('content-type')` prior to parsing JSON.
  2. **Doctype & HTML Interception**: If the response is not `application/json` or if the response text begins with `<!doctype` or contains `<html`, the client prevents calling `response.json()` and raises a descriptive, actionable error:
     `"Backend returned HTML instead of JSON (received '<!doctype ...>'). Ensure VITE_API_URL is properly configured to point to your Cloud Run service (e.g. https://grocery-list-app-api-bdxnar4rza-uc.a.run.app) and not the static frontend host."`
  3. **Multi-Tier Base URL Resolution Hierarchy**:
     - Precedence 1: Explicit user-configured URL stored in `localStorage.getItem('grocery_api_url')` or `localStorage.getItem('freshcart_api_url')`.
     - Precedence 2: Environment variable `import.meta.env.VITE_API_URL`.
     - Precedence 3: Local development fallback `http://localhost:8080` when `window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'`.
     - Precedence 4: Authoritative production Cloud Run fallback: `DEFAULT_PRODUCTION_API_URL` (`https://grocery-list-app-api-bdxnar4rza-uc.a.run.app`).
     - Never returns `''` in production to prevent static host SPA rewrites from returning `index.html`.
     - Both `API_BASE`, `API_BASE_URL`, and `DEFAULT_PRODUCTION_API_URL` are consistently exported.
  4. **Health Check Utility**: Exports `checkBackendHealth(url?: string)` and `api.checkHealth(url?: string)` to test endpoints (`/health`) before saving configurations.
  5. **Safe In-Memory Demo Fallback**: When HTML responses or connection errors are detected, `useGroceryList` activates Demo Mode with default seeded grocery lists and items, permitting full add, edit, toggle, quantity adjustment, and batch clear interactions without crashing.

### Development Server Proxy (`frontend/vite.config.ts`)
- In local development, `frontend/vite.config.ts` configures a proxy forwarding `/api` to the backend server (`http://localhost:8080`), ensuring local developers never receive `index.html` when making API requests:
  ```typescript
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
  ```

### TypeScript & Vite Environment Typing (`import.meta.env`)
- To prevent TypeScript compile errors during `tsc && vite build` (such as `error TS2339: Property 'env' does not exist on type 'ImportMeta'`), the project MUST include `frontend/src/vite-env.d.ts` declaring Vite client type references and environmental typing:
  ```typescript
  /// <reference types="vite/client" />

  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    [key: string]: any;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  ```
- In `frontend/tsconfig.json`, `compilerOptions` MUST include `"types": ["vite/client"]` and `"skipLibCheck": true` to ensure the TypeScript compiler recognizes Vite's global augmentations.
- In `frontend/src/api/client.ts`, access to `import.meta.env` is safely guarded with runtime fallbacks and `API_BASE` is exported.

---

## 8. Data Model

### Entities & Document Schema

#### List Entity
Collection: `grocery-list-app_lists` (or subcollection under `grocery-list-app`)
```typescript
interface GroceryList {
  id: string;               // e.g. "list_weekly_groceries" or UUID
  name: string;             // e.g. "Weekly Groceries"
  description?: string;     // e.g. "Regular household staples"
  isDefault: boolean;       // true if default list
  createdAt: string;        // ISO 8601 string
  updatedAt: string;        // ISO 8601 string
}
```

#### Item Entity
Collection: `grocery-list-app_items` (or subcollection under `grocery-list-app`)
```typescript
interface GroceryItem {
  id: string;               // e.g. "item_9b1deb4d"
  listId: string;           // Foreign key referencing GroceryList.id
  name: string;             // Item title, e.g. "Honeycrisp Apples"
  quantity: number;         // Positive number, default 1
  unit: string;             // "pcs", "kg", "lbs", "pack", etc.
  category: string;         // "Produce" | "Dairy & Eggs" | ...
  priority: 'low' | 'medium' | 'high';
  notes?: string;           // Optional shopper instructions
  isCompleted: boolean;     // Status toggle
  createdAt: string;        // ISO 8601 string
  updatedAt: string;        // ISO 8601 string
}
```

---

## 9. API

### Endpoints Specification

#### 1. `GET /health` and `GET /api/health`
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "service": "grocery-list-app-api",
    "timestamp": "2026-10-11T12:00:00.000Z",
    "storage": "firestore"
  }
  ```

#### 2. `GET /api/lists`
- Returns all lists. Auto-seeds "Weekly Groceries" if database is empty.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "list_weekly_groceries",
      "name": "Weekly Groceries",
      "description": "Weekly essentials",
      "isDefault": true,
      "itemCount": 5,
      "completedCount": 2,
      "createdAt": "2026-10-11T12:00:00.000Z",
      "updatedAt": "2026-10-11T12:00:00.000Z"
    }
  ]
  ```

#### 3. `POST /api/lists`
- **Request Body**:
  ```json
  {
    "name": "Costco Run",
    "description": "Bulk purchases"
  }
  ```
- **Response `201 Created`**: Returns created list document.

#### 4. `GET /api/lists/:listId`
- **Response `200 OK`**: Returns list details and item counts.
- **Response `404 Not Found`**: List does not exist.

#### 5. `DELETE /api/lists/:listId`
- Cascades deletion to all items under `listId`.
- **Response `200 OK`**: `{ "success": true, "deletedListId": "...", "deletedItemsCount": 4 }`

#### 6. `GET /api/items`
- **Query Parameters**:
  - `listId`: string (optional, defaults to active or all)
  - `category`: string (optional)
  - `isCompleted`: boolean string (`"true"` / `"false"`)
  - `search`: string (case-insensitive substring on name and notes)
  - `sort`: `"aisle"` | `"name"` | `"priority"` | `"newest"`
- **Response `200 OK`**: Array of `GroceryItem` objects.

#### 7. `POST /api/items`
- **Request Body**:
  ```json
  {
    "listId": "list_weekly_groceries",
    "name": "Organic Whole Milk",
    "quantity": 2,
    "unit": "gallons",
    "category": "Dairy & Eggs",
    "priority": "high",
    "notes": "Check expiration date"
  }
  ```
- **Response `201 Created`**: Returns created `GroceryItem`.

#### 8. `PATCH /api/items/:id`
- **Request Body** (partial update):
  ```json
  {
    "isCompleted": true,
    "quantity": 3
  }
  ```
- **Response `200 OK`**: Returns updated `GroceryItem`.

#### 9. `DELETE /api/items/:id`
- **Response `200 OK`**: `{ "success": true, "deletedItemId": "..." }`

#### 10. `POST /api/items/clear-completed`
- **Request Body**: `{ "listId": "list_weekly_groceries" }`
- **Response `200 OK`**: `{ "success": true, "clearedCount": 3 }`

#### 11. `ANY *` (404 Fallback)
- **Response `404 Not Found`**:
  ```json
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "Endpoint GET /unmatched not found"
    }
  }
  ```
  Guarantees consistent JSON error delivery with `Content-Type: application/json` for any unmatched path.

---

## 10. Configuration

### Backend Environment Variables (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Listening port for Express HTTP server | `8080` |
| `NODE_ENV` | Runtime environment (`production`, `development`, `test`) | `production` |
| `GCP_PROJECT_ID` | Google Cloud project ID for Firestore | `ai-learning-499409` |
| `FIRESTORE_COLLECTION` | Dedicated root collection prefix | `grocery-list-app` |
| `CORS_ORIGIN` | Allowed CORS origin regex or domain | `*` |

*Note: `PORT` is never passed to `--set-env-vars` on Cloud Run because Cloud Run reserves and automatically injects it. Cloud Run is configured using `--port 8080`.*

### Frontend Environment Variables (`frontend/.env`, `frontend/.env.production`)
| Variable | Description | Production Default | Local Default |
|---|---|---|---|
| `VITE_API_URL` | Base URL of deployed Cloud Run backend API | `https://grocery-list-app-api-bdxnar4rza-uc.a.run.app` | `http://localhost:8080` |

### Runtime Frontend Configuration & Fallback Precedence
1. **User Override**: If `grocery_api_url` or `freshcart_api_url` exists in `localStorage`, the UI directs all API requests to this target.
2. **Build-Time Environment**: If `import.meta.env.VITE_API_URL` is set and non-empty, it is used.
3. **Localhost Fallback**: If hostname is `localhost` or `127.0.0.1`, defaults to `http://localhost:8080`.
4. **Authoritative Production Cloud Run Fallback**: Defaults to `DEFAULT_PRODUCTION_API_URL` (`https://grocery-list-app-api-bdxnar4rza-uc.a.run.app`). The frontend never makes relative API requests in production to prevent static host SPA rewrites returning HTML doctype documents.
5. **Offline Demo Fallback**: If backend connection yields HTML or network failure, the application activates in-memory Demo Mode with full local CRUD capabilities.

---

## 11. Testing

### Test Suites
1. **Backend Unit & Integration Tests (`backend/tests/`)**:
   - `lists.test.ts`: List creation, default seeding, retrieval with item counts, cascading deletion.
   - `items.test.ts`: Item creation with validation, quantity stepper, completion toggle, aisle category filtering, search, batch clear.
   - Authoritative Jest Configuration: Managed exclusively through `backend/jest.config.js` with `ts-jest` preset and explicit `--config jest.config.js` flag. The `"jest"` property is strictly omitted from `backend/package.json` to avoid Jest implicit multiple configurations conflict.
2. **Contract, Mock Storage & Defensive Guard Tests (`tests/test_grocery_list_app.py`)**:
   - Verifies all 12 mandatory sections in `SPEC.md`.
   - Validates Cloud Run source deployment workflow configuration and reserved `PORT` constraints.
   - Validates Vercel team `noam-projects2` and project name `grocery-list-app-ui` configuration.
   - Validates Vite client types, `ImportMetaEnv`, and defensive `API_BASE` export.
   - Validates HTML doctype detection and content-type parsing guard in `frontend/src/api/client.ts`.
   - Validates Vite dev server proxy configuration in `frontend/vite.config.ts`.
   - Validates backend 404 JSON catch-all handler in `backend/src/app.ts`.
   - Simulates grocery data store operations (CRUD, filtering, search, cascade delete, batch clear).
3. **Execution Commands**:
   - Backend: `npm test` inside `backend/` (`jest --config jest.config.js --passWithNoTests`)
   - Frontend: `npm test` inside `frontend/`
   - Integration: `python3 -m unittest discover tests`

---

## 12. Deployment

### Google Cloud Run (Backend API)
- **Service Name**: `grocery-list-app-api`
- **GCP Project ID**: `ai-learning-499409`
- **Region**: `us-central1`
- **Authentication**: Unauthenticated (`--allow-unauthenticated`)
- **Port**: `--port 8080` (Configured solely via flag; `PORT` is never passed to `--set-env-vars`)
- **Deployment Mode**: Source deployment (`gcloud run deploy grocery-list-app-api --source . ...` executed inside `./backend`)
- **Secret**: `GCP_SA_KEY` (Google Cloud Service Account JSON)
- **GitHub Actions Workflow**: `.github/workflows/deploy-backend.yml`
  - Trigger: `push` to `main` branch matching `backend/**`, `SPEC.md`, `package.json`, or workflow file, plus `workflow_dispatch`.
  - Condition: `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
  - Dependency Installation: Uses `npm install` (avoiding `npm ci` failures due to uncommitted lockfiles)
  - Testing Step: Configured with dedicated standalone `backend/jest.config.js` with `ts-jest` preset and explicit `--config jest.config.js` in `package.json` (with `"jest"` key removed from `package.json`) so `npm test` runs cleanly without multiple configuration resolution conflicts.
  - Deployment Command:
    ```bash
    gcloud run deploy grocery-list-app-api \
      --source . \
      --project ai-learning-499409 \
      --region us-central1 \
      --allow-unauthenticated \
      --port 8080 \
      --quiet \
      --set-env-vars "GCP_PROJECT_ID=ai-learning-499409,FIRESTORE_COLLECTION=grocery-list-app,NODE_ENV=production,CORS_ORIGIN=*"
    ```
  - Multi-stage `Dockerfile` and `.gcloudignore` provide deterministic container compilation fallback without requiring local docker execution. Express server binds to `0.0.0.0` and listens on `PORT` provided by Cloud Run.

### Vercel (Frontend UI)
- **Project Name**: `grocery-list-app-ui`
- **Scope / Team**: `noam-projects2`
- **Secret**: `VERCEL_TOKEN` (Only `VERCEL_TOKEN` is required; `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are not needed)
- **GitHub Actions Workflow**: `.github/workflows/deploy-frontend.yml`
  - Trigger: `push` to `main` branch matching `frontend/**`, `SPEC.md`, `package.json`, or workflow file, plus `workflow_dispatch`.
  - Condition: `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
  - Dependency Installation: Uses `npm install` (avoiding `npm ci` failures due to uncommitted lockfiles)
  - Step Name: `Deploy grocery-list-app-ui to Vercel`
  - Deployment Command: Direct non-interactive CLI deployment:
    ```bash
    vercel deploy --prod --scope noam-projects2 --token ${{ secrets.VERCEL_TOKEN }} --yes
    ```
  - Crucial fix: Vercel CLI's `deploy` subcommand does not accept `--project` (which triggers `error: unknown option '--project'`). Project identity is determined by `"name": "grocery-list-app-ui"` defined in `frontend/vercel.json` and `frontend/package.json`.
  - Avoids `vercel pull` and `--prebuilt` flows that require nonexistent `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets.
  - `vercel.json` configures SPA routing rewrites to `/index.html`.

### Root Cause Analysis & Deployment Hardening
1. **Failure Cause 1: `npm ci` lockfile requirement in GitHub Actions**
   - *Problem*: Workflows executed `npm ci` in environments without `package-lock.json`, causing immediate step failure.
   - *Resolution*: Updated workflow steps to use `npm install`, which cleanly reads `package.json` dependencies.
2. **Failure Cause 2: Missing Vercel Organization & Project ID Secrets**
   - *Problem*: Frontend workflow used `vercel pull` with `${{ secrets.VERCEL_ORG_ID }}` and `${{ secrets.VERCEL_PROJECT_ID }}`. In repositories where only `VERCEL_TOKEN` is configured, `vercel pull` aborts.
   - *Resolution*: Replaced `vercel pull` / `vercel build` / `vercel deploy --prebuilt` with direct `vercel deploy --prod --scope noam-projects2 --token ${{ secrets.VERCEL_TOKEN }} --yes`.
3. **Failure Cause 3: Cloud Run Buildpack TypeScript Pruning**
   - *Problem*: In default Cloud Buildpacks, `typescript` in `devDependencies` is pruned or omitted when installing in production mode, leading to `tsc: command not found`.
   - *Resolution*: Added `typescript` and type definitions into `backend/package.json` dependencies, added `"gcp-build": "tsc"`, created `.gcloudignore`, and added a production multi-stage `Dockerfile` in `backend/` for bulletproof Cloud Run source deployment.
4. **Failure Cause 4: Cloud Run Reserved PORT Variable**
   - *Rule*: Cloud Run forbids passing `PORT` in `--set-env-vars`. Only `--port 8080` is used, and the backend Express server binds to `process.env.PORT || 8080` on `0.0.0.0`.
5. **Failure Cause 5: Vercel CLI unknown option `--project` on `vercel deploy`**
   - *Problem*: `vercel deploy --project grocery-list-app-ui ...` failed because `--project` is not a recognized flag for `vercel deploy` in Vercel CLI.
   - *Resolution*: Removed `--project` from `vercel deploy`. The project name `grocery-list-app-ui` is already specified in `frontend/vercel.json` and `frontend/package.json`, which Vercel CLI automatically reads when run within `./frontend`.
6. **Failure Cause 6: Missing Jest TypeScript Configuration (`ts-jest`) in `backend/`**
   - *Problem*: `npm test` in `backend` failed during CI because Jest tried to run `items.test.ts` and `lists.test.ts` without a Jest config, causing `SyntaxError: Cannot use import statement outside a module`.
   - *Resolution*: Added `backend/jest.config.js` with `ts-jest` preset.
7. **Failure Cause 7: Non-Interactive Prompting in `gcloud run deploy`**
   - *Problem*: `gcloud run deploy` in automated CI environments may block or fail when prompting to create Artifact Registry repositories or enable services if stdin is closed.
   - *Resolution*: Added the `--quiet` flag to `gcloud run deploy` to ensure headless, fully non-interactive execution.
8. **Failure Cause 8: Vercel Build TS2339 Property 'env' does not exist on type 'ImportMeta'**
   - *Problem*: During Vercel build (`tsc && vite build`), TypeScript compiler failed with:
     ```
     src/api/client.ts(3,30): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
     src/api/client.ts(4,17): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
     ```
     This occurred because Vite's ambient client types (`vite/client`) were not linked in the TypeScript compiler context, and `frontend/src/vite-env.d.ts` was missing.
   - *Resolution*:
     1. Created `frontend/src/vite-env.d.ts` with `/// <reference types="vite/client" />` and explicit `ImportMeta` / `ImportMetaEnv` interface augmentation.
     2. Configured `frontend/tsconfig.json` with `"types": ["vite/client"]` and `"skipLibCheck": true` under `compilerOptions`.
     3. Hardened `frontend/src/api/client.ts` with safe environment variable resolution and defensive fallback.
9. **Failure Cause 9: Multiple Jest Configurations Conflict (`jest.config.js` and `package.json` 'jest' key)**
   - *Problem*: In GitHub Actions Cloud Run backend deployment step (`Run npm test`), Jest aborted with:
     ```
     ● Multiple configurations found:
         * /home/runner/work/grocery-list-app/grocery-list-app/backend/jest.config.js
         * `jest` key in /home/runner/work/grocery-list-app/grocery-list-app/backend/package.json
       Implicit config resolution does not allow multiple configuration files.
       Either remove unused config files or select one explicitly with `--config`.
     ```
     Jest does not permit both a standalone `jest.config.js` file and an inline `"jest"` object within `package.json` under implicit configuration discovery.
   - *Resolution*:
     1. Removed the `"jest"` key from `backend/package.json` to eliminate ambiguous duplicate configuration definitions.
     2. Maintained the single authoritative `backend/jest.config.js` specifying the `ts-jest` preset, `tsconfig.json` transformation, and node environment.
     3. Updated `backend/package.json` script `"test"` to explicitly pass `--config jest.config.js --passWithNoTests`, ensuring unambiguous execution across all environments.
10. **Failure Cause 10: Frontend UI Runtime `Unexpected token '<', "<!doctype "... is not valid JSON`**
    - *Problem*: In deployed SPAs or local environments where `VITE_API_URL` is empty, unconfigured, or points to the frontend host, client fetch calls to relative paths (e.g., `/api/lists`) trigger Vercel's catch-all SPA rewrite rule (`/(.*) -> /index.html`). Vercel returns `index.html` (which starts with `<!doctype html>`) with HTTP status `200 OK`. When the frontend naively calls `response.json()`, the JavaScript engine aborts with:
      `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`.
    - *Resolution*:
      1. Hardened `frontend/src/api/client.ts`: Inspects `response.headers.get('content-type')` before JSON parsing. If the response is not `application/json` or text begins with `<!doctype` or contains `<html`, reads the response as text and raises an explicit, user-friendly descriptive error pointing to `VITE_API_URL` configuration rather than crashing with an unhandled JSON parse syntax error.
      2. Added dynamic API base resolution: Checks `localStorage.getItem('freshcart_api_url')`, then `import.meta.env.VITE_API_URL`, with localhost default `http://localhost:8080` and exports both `API_BASE` and `API_BASE_URL`.
      3. Added interactive in-app `DiagnosticBanner`: Renders when an HTML response or API disconnection is detected, allowing users to configure the backend Cloud Run URL at runtime, test connection with a health check, or switch to offline Demo Mode.
      4. Configured development proxy in `frontend/vite.config.ts`: Forwards `/api` to `http://localhost:8080` during local development so Vite's SPA fallback is never hit for API routes.
      5. Added backend 404 JSON catch-all in `backend/src/app.ts`: Unhandled endpoints return structured JSON with status 404 rather than Express's default HTML page.
11. **Failure Cause 11: Production UI Disconnected from Cloud Run API (HTML Response Intercepted Loop)**
    - *Problem*: Although the backend API was deployed to Google Cloud Run (`grocery-list-app-api` in `ai-learning-499409` at `https://grocery-list-app-api-bdxnar4rza-uc.a.run.app`), the deployed Vercel frontend still displayed `Backend API Connection Notice (HTML Response Intercepted)` and operated in Demo Mode.
    - *Root Causes*:
      1. `getApiBaseUrl()` returned `""` (empty string) in production when `VITE_API_URL` was not bundled in the build, causing client fetch calls to hit relative paths `/api/...` on the static Vercel host.
      2. SPA rewrites in `frontend/vercel.json` redirected static `/api/...` calls to `/index.html`, returning HTML with status 200.
      3. Absence of an authoritative default production Cloud Run fallback URL (`DEFAULT_PRODUCTION_API_URL`) in `client.ts`.
      4. Missing `frontend/.env.production` containing the production Cloud Run URL, meaning Vercel builds did not embed `VITE_API_URL`.
      5. Absence of an easily accessible `ConnectionModal` and live header status badge allowing users to verify, test, or switch backend targets interactively.
    - *Resolution*:
      1. Defined authoritative `DEFAULT_PRODUCTION_API_URL = 'https://grocery-list-app-api-bdxnar4rza-uc.a.run.app'`.
      2. Updated `getApiBaseUrl()` to prioritize `localStorage`, then `VITE_API_URL`, then localhost (for local development), and default strictly to `DEFAULT_PRODUCTION_API_URL` for hosted production environments. It never returns `''` on production hosts.
      3. Created `frontend/.env.production` and `frontend/.env` defining `VITE_API_URL=https://grocery-list-app-api-bdxnar4rza-uc.a.run.app`.
      4. Implemented `ConnectionModal.tsx` and integrated interactive connection status pill in `Header.tsx` displaying real-time connection status (Connected / Intercepted / Custom) and ping latency.
      5. Added direct 1-click "Connect to Cloud Run" action in `DiagnosticBanner.tsx` and `ConnectionModal.tsx`.
      6. Enhanced `.github/workflows/deploy-frontend.yml` to automatically query the Cloud Run service URL and bake `VITE_API_URL` into the production build.



