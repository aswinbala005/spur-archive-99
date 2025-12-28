<script lang="ts">
import DOMPurify from "dompurify";
import { ThumbsDown, ThumbsUp } from "lucide-svelte";
import { marked } from "marked";

// Svelte 5 Props: Typed strictly
// Note: We use 'let' for props in Svelte 5 runes mode
const { role, content } = $props<{
  role: string;
  content: string;
}>();

// Svelte 5 Derived State: Updates automatically when content changes
// This ensures markdown is re-parsed if the streaming content updates
const safeHtml = $derived.by(() => {
  // 1. Parse Markdown -> Unsafe HTML
  const raw = marked.parse(content) as string;
  // 2. Sanitize HTML -> Safe HTML (Strips <script> tags, etc.)
  return DOMPurify.sanitize(raw);
});

let feedbackStatus = $state<"up" | "down" | null>(null);

async function sendFeedback(type: "up" | "down") {
  if (feedbackStatus) return; // Prevent spam

  // Optimistic UI Update
  feedbackStatus = type;

  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: type, sessionId: "current-session" }), // In real app, sessionId comes from context
    });
    console.log(`Feedback sent: ${type}`);
  } catch (e) {
    console.error("Feedback failed", e);
    // Revert on failure if needed, but for logs usually keep optimistic
  }
}
</script>
  
  <!-- 
	Message Container 
	- Aligns right for user (blue/black)
	- Aligns left for assistant (gray)
  -->
  <div class={`flex w-full mb-4 ${role === "user" ? "justify-end" : "justify-start"}`}>
	  <div
		  class={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed relative group ${
			  role === "user"
				  ? "bg-neutral-200 text-neutral-900 rounded-tr-none"
				  : "bg-muted text-foreground border border-border rounded-tl-none"
		  }`}
	  >
		  <!-- Secure HTML Rendering -->
		  <!-- The 'prose' class from Tailwind Typography plugin handles the markdown styling -->
		  <div class="prose prose-sm dark:prose-invert max-w-none break-words">
			  {@html safeHtml}
		  </div>

          {#if role === "assistant"}
            <div class={`absolute -bottom-6 left-0 flex items-center gap-2 transition-opacity ${feedbackStatus ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button 
                    class={`p-1 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors hover:text-green-500 ${feedbackStatus === 'up' ? 'text-green-500' : ''}`} 
                    aria-label="Helpful" 
                    onclick={() => sendFeedback("up")}
                    disabled={!!feedbackStatus}
                >
                     <ThumbsUp class="h-3 w-3" />
                </button>
                <button 
                    class={`p-1 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors hover:text-red-500 ${feedbackStatus === 'down' ? 'text-red-500' : ''}`} 
                    aria-label="Not Helpful" 
                    onclick={() => sendFeedback("down")}
                    disabled={!!feedbackStatus}
                >
                     <ThumbsDown class="h-3 w-3" />
                </button>
            </div>
          {/if}
	  </div>
  </div>
