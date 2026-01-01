# Components Library (`src/lib/components`)

**Role**: The Visual Building Blocks.
**Strategy**: "Owned Code" (ShadCN) + "Feature Composition".
**Status**: Atomic Design.

---

## 🏗️ 1. Directory Structure

We separate "Dumb" primitives from "Smart" features.

```bash
src/lib/components/
├── ui/                  # 🧱 The Primitives (ShadCN)
│   ├── button/
│   └── input/
├── chat/                # 🧩 The Chat Feature
│   ├── ChatWidget.client.svelte
│   └── MessageBubble.svelte
```

---

## 🧱 2. UI Primitives (`/ui`)

These components are **Not** installed via npm. They are copy-pasted code that we own and customize.
*   **Source**: [shadcn/ui](https://ui.shadcn.com/)
*   **Tech**: Radix UI (Headless) + Tailwind CSS.

### Key Components
1.  **Button**: Base interaction element.
    *   *Usage*: `<Button variant="outline" size="sm" />`
    *   *Customization*: "Old Money" aesthetic (sharp corners, `neutral-900` background).
2.  **Input**: Text entry.
    *   *Usage*: `<Input placeholder="Ask Aria..." />`
    *   *Customization*: Focus rings are set to `ring-black`.

---

## 🧩 3. Feature Components (`/chat`)

These are complex compositions of Primitives + Logic.

### `ChatWidget.client.svelte`
*   **Role**: The root of the Chat application.
*   **Suffix**: `.client.svelte` ensures this **NEVER** runs on the server (SSR). It strictly requires the Browser DOM (for `window`, `localStorage`, `scrollTo`).
*   **Docs**: See [Widget Documentation](../widget/widget.md) for the deep dive on its state machine.

### `MessageBubble.svelte`
*   **Role**: Displays a single turn in the conversation.
*   **Logic**:
    *   **User**: Right-aligned, Dark bg.
    *   **Aria**: Left-aligned, Light bg, supports Markdown.
    *   **Optimistic**: Shows "Sending..." opacity state if not yet confirmed by server.

---

## 🔗 4. Backend integration

While `ui/` components are pure, `chat/` components interact with the API.

| Component | Backend Service | Connection |
| :--- | :--- | :--- |
| `ChatWidget` | `LLMService` | Streams tokens from Llama 3. |
| `Button` | N/A | Pure Visual. |

---

## 🎨 5. Design Guidelines

When creating new components:
1.  **Do not invent styles**. Use `ui/` primitives.
2.  **Do not add margin**. Components should fill their container.
3.  **Strict Typing**. All props must have TypeScript interfaces.
