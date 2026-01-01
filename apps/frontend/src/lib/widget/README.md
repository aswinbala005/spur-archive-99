# Chat Widget (Aria)

**Role**: The "Client-Side Brain" of Archive 99.
**Location**: `src/lib/components/chat/ChatWidget.client.svelte`
**Tech**: Svelte 5 Runes + Stream API.
**Status**: Production Critical.

---

## 🧠 1. The Need (Why this exists?)
In a standard e-commerce site, the "Search Bar" is a database query. In Archive 99, the search bar is an **Agent**.
Aria needs to be:
1.  **Persistent**: She follows you from the Home Page to the Product Page.
2.  **Optimistic**: She feels instant, even if the LLM takes 2 seconds to "think".
3.  **Aware**: She knows what page you are looking at (Context).

This requires a complex, stateful "Micro-App" running inside the global layout.

---

## 🏗️ 2. Architecture & Layers

### Layer 1: The Floating Trigger (UI)
*   **State**: `isOpen` (Boolean).
*   **Behavior**: When closed, it shows a "Callout" bubble with an animation loop to attract attention.
*   **Z-Index**: `z-[100]` (Floats above everything).

### Layer 2: The Logic Core (State Management)
We use **Svelte 5 Runes** for fine-grained reactivity.

```typescript
// Svelte 5 Concept: Mutable State
let messages = $state([]); 
let isOpen = $state(false);
```

*   **Optimistic Updates**:
    When you hit "Send":
    1.  We **immediately** push your message to the `messages` array.
    2.  The UI updates instantly.
    3.  We *then* start the network request.
    *(See `handleSubmit` in `ChatWidget.client.svelte`)*

### Layer 3: Unidirectional Data Flow (Streaming)
We do not wait for the full JSON response. We stream text.

1.  **POST** `/api/chat`
2.  **Stream**: The Backend (Fastify) pipes the LLM token stream directly to the browser.
3.  **Reader**: We use `response.body.getReader()` to decode chunks.
4.  **Reactivity**: `messages[lastIndex].content += chunk` triggers a UI re-render for every character.

---

## 🔗 3. Backend Integration
*Reference: [Backend API Routes](../../../../backend/src/routes/routes.md)*

The Widget talks to the **Decision Engine** via strict JSON contracts.

| Endpoint | Method | Purpose | Data |
| :--- | :--- | :--- | :--- |
| `/api/chat` | `POST` | The Conversation Loop. | `{ messages: [...] }` |
| `/api/chat/messages` | `GET` | History Hydration. | Fetches last 50 turns. |
| `/api/chat/reset` | `POST` | Clear Context. | Deletes session history. |

---

## 🧩 4. Component Hierarchy

The Widget is composed of smaller "Atoms" from ShadCN.

`ChatWidget.client.svelte` (Values Provider)
├── `ChatWindow` (Container)
│   ├── `Header` (Reset/Close controls)
│   ├── `ScrollArea` (Auto-scroll logic)
│   │   └── `MessageBubble` (Markdown Renderer)
│   └── `InputArea` (Form Submission)
│       ├── `Input` (ShadCN)
│       └── `Button` (ShadCN)

---

## 🎨 5. visual Design ("Old Money")
*   **Typography**: Inter (Clean) + Playfair Display (Headings).
*   **Motion**:
    *   **Entrance**: `animate-in zoom-in-95` (Subtle pop).
    *   **Thinking**: Custom `animate-spin-slow` Sparkles.
*   **Glassmorphism**: The backdrop uses `backdrop-blur-sm` to keep focus on the chat while keeping the store visible.
