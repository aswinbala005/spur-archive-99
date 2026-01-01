# 10. Technical Roadmap & Future Architecture

**Role**: A forward-looking detailed technical plan.
**Current Status**: Phase 1 (Foundation) Complete.

This document outlines not just *what* we want to build, but *how* we will architect it within the existing [backend.md](../apps/backend/backend.md) structure.

---

## 📅 Phase 2: The "Conversational Commerce" Upgrade (Next 3 Months)

### 1. Voice Mode (WebSockets)
*   **The Need**: Typing on mobile during a drop is slow. Real vintage buyers want to "shout" at the archivist.
*   **Tech Stack**:
    *   **Frontend**: `MediaRecorder API` -> Blob.
    *   **Backend**: Upgrade `POST /chat` to a **WebSocket** connection (`fastify-websocket`).
    *   **AI**: OpenAI Whisper (STT) -> Llama 3 -> OpenAI TTS.
*   **Layer Impact**:
    *   `src/routes/socket.ts`: New streaming endpoint.
    *   `src/services/VoiceService.ts`: Handling binary audio streams.

### 2. "Shop the Look" (Multimodal Search)
*   **The Need**: Users want to upload a photo of a Pinterest outfit and say "Find this".
*   **Tech Stack**:
    *   **Model**: **CLIP** (Contrastive Language-Image Pre-Training).
    *   **Vector DB**: We will need to upgrade from `pgvector` to **Pinecone** or **Milvus** to handle high-dimensional image vectors alongside text.
*   **Layer Impact**:
    *   `src/services/VisionService.ts`: To process image inputs.

---

## 📅 Phase 3: Enterprise Features (Q3 2026)

### 3. Native Checkout (Stripe Agents)
*   **The Need**: Currently, users leave the chat to checkout. We want "In-Chat Checkout".
*   **Logic**:
    1.  User: "I'll take the Stussy Hoodie."
    2.  **LLM Router**: Calls `createCheckoutSession`.
    3.  **Service**: `StripeService` generates a payment link.
    4.  **UI**: Renders a specialized "Pay Now" card directly in the chat window.
*   **Security**: Requires moving from Anonymous Cookies to **Auth.js** (User Accounts) to save shipping details safely.

### 4. The "Swarm" Architecture
*   **Evolution**: Currently, `LLMService` is a single "Router".
*   **Future**: We will move to a **Multi-Agent System**.
    *   **Sales Agent**: Aggressive, tries to close.
    *   **Support Agent**: Conservative, references policy.
    *   **Stylist Agent**: Creative, focuses on "Vibes".
*   **Tech**: We will likely use **LangGraph** to manage the state moves between these agents.

---

## 📉 Technical Debt & Optimization

### 1. Vector Database Migration
*   *Current*: `pgvector` (Good for <10k items).
*   *Future*: When we hit 100k items, PostgreSQL index building will slow down. We will migrate `documents` table to a dedicated Cluster.

### 2. Testing Pipeline (LLM-as-a-Judge)
*   *See [11-testing.md](11-testing.md)*
*   We need to build a regression suite where **GPT-4** grades **Llama-3's** answers to ensure Aria doesn't become "dumber" as we optimize prompts.

---

## 📂 Impact Map

| Feature | Primary Domain | New Service Required? | Complexity |
| :--- | :--- | :--- | :--- |
| **Voice Mode** | Interface (Frontend) | `VoiceService` | High (Streaming) |
| **Image Search** | AI (Embedding) | `VisionService` | High (Multimodal) |
| **Stripe** | Business Logic | `PaymentService` | Medium (API Integration) |
| **Auth** | Security | `AuthService` | Medium (OAuth) |
