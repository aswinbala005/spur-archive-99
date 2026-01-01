# Frontend Library (`$lib`)

**Role**: The Shared Core.
**Alias**: `$lib` (SvelteKit default).
**Status**: Atomic Design Pattern.

---

## 🏗️ 1. Philosophy: "The Widget is the App"

Unlike traditional e-commerce sites where "Shopping" is the main app, Archive 99 is built as a **Hybrid Interface**.
*   **The Storefront** (`routes/`) is just a clean, static backdrop.
*   **The Widget** (`lib/widget/`) is the actual sophisticated Application.

This folder contains the reusable logic that powers this philosophy.

---

## 📂 2. Directory Structure

### A. [`widget/`](./widget/widget.md)
The AI Chat Interface.
*   **Role**: A self-contained "Micro-Frontend".
*   **Tech**: Svelte 5 Runes (`$state`).
*   **Logic**:
    *   Handles `POST /chat` streaming.
    *   Manages "Optimistic UI" state (Message bubbles appear before server responds).
    *   Persists history via `localStorage` (for session continuity).

### B. [`components/`](./components/components.md)
The UI Atoms (ShadCN).
*   **Role**: Dumb, stateless visual primitives.
*   **Tech**: Tailwind CSS + Radix UI (Headless).
*   **Key Atoms**:
    *   `Button`: The primary interaction element.
    *   `Input`: Auto-growing text areas.
    *   `Badge`: Used for "Sold Out" status.

### C. `utils.ts`
The "Glue" code.
*   **`cn(...)`**:
    *   **Purpose**: Merges Tailwind classes intelligently.
    *   **Why?**: We need to override utility classes dynamically (e.g., changing a button from Black to Red for errors).
    *   `clsx` handles conditionals.
    *   `tailwind-merge` resolves conflicts (`px-4` vs `px-2`).

---

## 🔗 3. Connection to Backend

While this code runs in the browser, it mirrors the Backend data structures.

### Type Parity
We manually keep types in sync with **Backend Zod Schemas** ([apps/backend/src/services/services.md](../../../backend/src/services/services.md)).

| Frontend Type | Backend Schema |
| :--- | :--- |
| `Message` | `z.object({ role, content })` |
| `Product` | `products` table (Drizzle) |

*Note: In a larger team, we would use strict type-sharing (monorepo packages), but for V1, implicit contract is maintained via documentation.*

---

## 🎨 4. Design System (Old Money)

All components in `$lib` adhere to the strict aesthetic guidelines defined in `app.css`.
*   **Font**: `font-serif` (Playfair Display) for Headings.
*   **Color**: `neutral-900` (Off-Black) instead of `black`.
*   **Radius**: `rounded-none` or `rounded-sm` (Sharp edges preferred).
