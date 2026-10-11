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
   - Dark/Light mode toggle button.
2. **`FilterBar`**:
   - Live search input with single-click clear button.
   - Status tabs: `All`, `Active`, `Completed`.
   - Category filter pills with counts.
   - View mode toggle: `Grouped by Aisle` vs `List View`.
   - Sort dropdown: Category, A-Z, Priority, Newest.
3. **`AddItemForm`**:
   - Item name input with instant category auto-detection.
   - Quantity input with quick `+` / `-` increment buttons.
   - Unit selection dropdown (`pcs`, `kg`, `lbs`, `oz`, `pack`, `box`, `bottle`, `bunch`, `can`).
   - Category picker with color dots.
   - Priority selector (`low`, `medium`, `high`).
   - Add button with keyboard shortcut (`Enter`).
4. **`GroceryItemCard`**:
   - Large touch checkbox.
   - Strike-through formatting when completed.
   - Quantity and unit badge.
   - Category badge with department color.
   - Priority indicator.
   - Quick `+` and `-` quantity steppers directly on card.
   - Delete button with confirmation toast.
5. **`BatchActionsBar`**:
   - Progress bar showing completed items vs total items.
   - "Clear Completed" button.
6. **`EmptyState`**:
   - Graphic and instructions when list is empty or search yields no matches.
7. **`ListSelectorModal`**:
   - Modal for listing, creating, switching, and deleting shopping lists.

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

### Frontend Environment Variables (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of deployed Cloud Run backend API | `http://localhost:8080` |

---

## 11. Testing

### Test Suites
1. **Backend Unit & Integration Tests (`backend/tests/`)**:
   - `lists.test.ts`: List creation, default seeding, retrieval with item counts, cascading deletion.
   - `items.test.ts`: Item creation with validation, quantity stepper, completion toggle, aisle category filtering, search, batch clear.
2. **Contract & Mock Storage Tests (`tests/api_contract_test.py`)**:
   - Offline verification verifying all REST endpoints, headers, payload validation, and in-memory mock semantics without external dependencies.
3. **Execution Commands**:
   - Backend: `npm test` inside `backend/`
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
  - Testing Step: Configured with `jest.config.js` and `ts-jest` preset in `package.json` so `npm test` successfully compiles TypeScript test files without syntax errors.
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
   - *Resolution*: Added `backend/jest.config.js` and added `"jest": { "preset": "ts-jest", "testEnvironment": "node", "testMatch": ["**/*.test.ts"] }` to `backend/package.json`.
7. **Failure Cause 7: Non-Interactive Prompting in `gcloud run deploy`**
   - *Problem*: `gcloud run deploy` in automated CI environments may block or fail when prompting to create Artifact Registry repositories or enable services if stdin is closed.
   - *Resolution*: Added the `--quiet` flag to `gcloud run deploy` to ensure headless, fully non-interactive execution.

