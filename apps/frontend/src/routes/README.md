# Frontend Routing & Page Logic

**Role**: The Sitemap of Archive 99.
**Framework**: SvelteKit (File-system based routing).
**Status**: Production Ready.

---

## 🏗️ 1. Global Structure

The application is wrapped in a single root layout which handles the permanent UI elements (Navigation, Chat Widget).

### `+layout.svelte`
*   **Responsibility**: The "Shell" of the application.
*   **Logic**:
    *   Imports global CSS (`../app.css`).
    *   Mounts the `<ChatWidget />` globally, so the conversation persists even when you navigate from "Home" to "Products".
    *   Handles Font Loading (Inter/Playfair Display).

### `+error.svelte`
*   **Responsibility**: Global Error Boundary.
*   **Trigger**: If any route throws a `404` or `500`.
*   **Design**: Displays a minimalist "404: Lost in the Archive" message with a button to go Home.

---

## 📄 2. Page Definitions

### A. Home (`/`)
*   **File**: [`+page.svelte`](./+page.svelte)
*   **Role**: Landing Page & Brand Statement.
*   **Logic**:
    *   Purely static visual component.
    *   Uses Tailwind animations (`animate-in`, `fade-in`) to sequence the text entrance.
    *   **Call to Actions**:
        *   "Ask Aria" (Focuses Chat Widget).
        *   "Browse Collection" (Navigates to `/products`).

### B. Catalog (`/products`)
*   **File**: [`products/+page.svelte`](./products/+page.svelte)
*   **Role**: The Inventory Grid.
*   **Data Strategy (CSR)**:
    *   We use **Client-Side Rendering** (CSR) via `onMount` instead of SvelteKit `load` functions.
    *   *Why?* To keep the frontend strictly coupled to the Fastify API `localhost:3000`, bypassing the SvelteKit Node layer entirely.
*   **Logic Flow**:
    1.  **Mount**: fetches `GET http://localhost:3000/products`.
    2.  **Loading**: Shows a skeleton pulse animation.
    3.  **Render**: Maps the JSON array to a Grid of Cards.
    4.  **Interaction**: Clicking a card opens a modal (no navigation). This keeps the user in the "Shopping Flow".

### C. Manifesto (`/about`)
*   **File**: [`about/+page.svelte`](./about/+page.svelte)
*   **Role**: Static Text page explaining the "Archive 99" philosophy.
*   **Logic**: Hardcoded HTML/Tailwind content.

---

## 🔗 3. Backend Integration
*Review Backend Docs: [apps/backend/src/routes/routes.md](../../../backend/src/routes/routes.md)*

The Frontend interacts with the Backend via standard `fetch` calls.

| Page | Endpoint | Method | Purpose |
| :--- | :--- | :--- | :--- |
| **Home** | `/chat` | `POST` | Sending messages to Aria. |
| **Products** | `/products` | `GET` | Fetching initial inventory grid. |
| **Widget** | `/hooks/persist` | `Webhook` | (Indirectly) Saving history via QStash. |

---

## 🎨 4. Design Decisions

1.  **Optimistic UI**:
    To make the vintage experience feel "Modern", we almost never show a spinner for navigation. The Chat Widget interactions appear instantly locally before the network request completes.

2.  **Persistent Layout**:
    Because `ChatWidget` is in `+layout.svelte`, users can browse the `/products` grid while Aria is typing a response. The chat window does *not* close on navigation.

3.  **Modal vs Page**:
    We chose to open Product Details in a **Modal** (Overlay) rather than a new `/products/[id]` page. This encourages users to browse more items rapidly without "Pogo-sticking" (Back/Forward navigation).
