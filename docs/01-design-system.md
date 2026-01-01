# 01. Design System

## 🎨 Core Philosophy
**Archive 99** adheres to an **"Old Money" / Brutalist** aesthetic.
-   **Minimalism**: Whitespace is a feature, not a bug.
-   **Data Density**: Information (typography) takes precedence over decoration.
-   **Tangibility**: UI elements should feel "heavy" and premium (e.g., solid 1px borders, crisp shadows).

---

## 🌈 Color Palette
We use a semantic color system defined in CSS variables (`HSL`). This allows for instant, flicker-free Dark Mode switching.

| Token | Variable | HSL Value (Light) | Role | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `--primary` | `222.2 47.4% 11.2%` | Deep Charcoal | Main CTA buttons, Headings, active states. |
| **Background** | `--background` | `0 0% 100%` | Pure White | Page background. |
| **Foreground** | `--foreground` | `222.2 84% 4.9%` | Nearly Black | Body text. |
| **Muted** | `--muted` | `210 40% 96.1%` | Soft Grey | Secondary backgrounds, inactive buttons. |
| **Accent** | `--accent` | `210 40% 96.1%` | Vintage Gold | Highlights, special badges, hover states. |
| **Destructive** | `--destructive` | `0 84.2% 60.2%` | Alert Red | Delete actions, error messages. |
| **Border** | `--border` | `214.3 31.8% 91.4%` | Light Grey | Hairline dividers, input borders. |

### Dark Mode
Dark mode inverses these strictly.
-   **Background**: `222.2 84% 4.9%` (Deep Blue-Black)
-   **Foreground**: `210 40% 98%` (Off-White)

---

## 📐 Typography
We use the **Inter** font family (via `system-ui` fallback) for maximum legibility and load speed.

### Type Scale
| Element | Class | Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | `text-4xl` | 36px/2.25rem | ExtraBold (800) | Tight |
| **H2** | `text-3xl` | 30px/1.875rem | Bold (700) | Tight |
| **H3** | `text-2xl` | 24px/1.5rem | SemiBold (600) | Normal |
| **Body** | `text-base` | 16px/1rem | Regular (400) | Relaxed |
| **Small** | `text-sm` | 14px/0.875rem | Medium (500) | Normal |
| **Mono** | `font-mono` | - | - | - |

---

## 📏 Layout & Spacing

### Container
The global container constrains content width on large screens.
-   **Max Width**: `1400px` (2xl breakpoint).
-   **Padding**: `2rem` (horizontal).
-   **Center**: `margin-left: auto; margin-right: auto;`.

```javascript
// tailwind.config.js
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
},
```

### Radius
We use a standardized border radius of **0.5rem (8px)**.
-   **Variable**: `--radius: 0.5rem;`
-   **Utility**: `rounded-lg` (maps to `--radius`).
-   **Small**: `rounded-sm` (maps to `--radius - 4px`).

---

## 🧩 Components (ShadCN-Svelte)

### Buttons (`<Button />`)
-   **Default**: Solid Primary background, White text. Hover: 90% opacity.
-   **Outline**: Transparent background, Border `1px solid input`. Hover: Accent background.
-   **Ghost**: Transparent. Hover: Accent background.

### Cards (`<Card />`)
-   **Structure**: Header, Content, Footer.
-   **Style**: Border `1px solid border`, Background `card`, Text `card-foreground`.
-   **Shadow**: None (Flat design preference) or `shadow-sm`.

### Chat Bubbles
-   **User**: Primary background (`bg-primary`), Light text (`text-primary-foreground`). Aligned Right.
-   **AI**: Muted background (`bg-muted`), Dark text. Aligned Left. Markdown supported.

---

## 🎞️ Motion & Animation
We use CSS keyframes (`animate-in`) for subtle entrance animations. We avoid "jerky" interactions.

### Keyframes
```css
@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Utilities
-   `.animate-in`: Applies the animation (0.3s ease-out).
-   `.slide-in-from-bottom-2`: Starts 0.5rem down.
-   `.zoom-in`: Starts at scale 0.95.
