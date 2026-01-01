<script lang="ts">
/* 
	  IMPORTS 
	  - UI Components: ShadCN buttons and inputs.
	  - Icons: Lucide icons for the UI.
	  - tick: Svelte utility to wait for DOM updates (crucial for auto-scroll).
	*/
import { MessageSquare, RefreshCcw, Send, Sparkles, X } from "lucide-svelte";
import { onMount, tick } from "svelte";
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import MessageBubble from "./MessageBubble.svelte";

/* STATE MANAGEMENT (Svelte 5 Runes) */

// Tracks if the chat window is open or closed.
// We use 'let' for mutable state with Runes.
let isOpen = $state(false);

// A reference to the scrollable container DOM element.
let scrollContainer: HTMLElement | null = $state(null);

// Input state managed manually since Chat class doesn't handle UI state
let inputValue = $state("");

/* AI SDK INTEGRATION */

// Manual message management since Chat class format doesn't match backend
let messages = $state<
  Array<{
    id?: number;
    role: "user" | "assistant";
    content: string;
    feedback?: number;
  }>
>([]);
let isLoading = $state(false);

// Hydrate history on mount
onMount(async () => {
  try {
    const res = await fetch("/api/chat/messages");
    if (res.ok) {
      const history = await res.json();
      if (Array.isArray(history) && history.length > 0) {
        messages = history;
      }
    }
  } catch (err) {
    console.error("Failed to load history:", err);
  }
});

// Handle form submission
async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!inputValue.trim() || isLoading) return;

  const userMessage = inputValue;
  inputValue = ""; // Clear input immediately

  // Add user message to history
  messages = [...messages, { role: "user", content: userMessage }];

  isLoading = true;

  // Force scroll to bottom immediately to show the "Thinking" animation
  await tick();
  scrollContainer?.scrollTo({
    top: scrollContainer.scrollHeight,
    behavior: "smooth",
  });

  // Artificial delay to show "Aria is thinking" animation (User Request)
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Chat Error:", error);
      throw new Error(error.message || "Failed to get response");
    }

    // Read the streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    // Add empty assistant message that we'll update as we stream
    messages = [...messages, { role: "assistant", content: "" }];
    const messageIndex = messages.length - 1;

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

          // Update the message in real-time with reassignment for reactivity
          messages = messages.map((msg, idx) =>
            idx === messageIndex ? { ...msg, content: assistantMessage } : msg,
          );
        }
      } catch (streamError) {
        console.error("Stream Error:", streamError);
      }
    }

    // Ensure we have the final content
    if (!assistantMessage) {
      // If streaming failed, remove the empty message
      messages = messages.slice(0, -1);
    }
  } catch (error) {
    console.error("Chat Error:", error);
    // Show error message to user
    messages = [
      ...messages,
      {
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Sorry, I encountered an error. Please try again.",
      },
    ];
  } finally {
    isLoading = false;
  }
}

async function handleReset() {
  if (confirm("Start a new chat? This will clear your history.")) {
    try {
      await fetch("/api/chat/reset", { method: "POST" });
      messages = [];
    } catch (e) {
      console.error("Failed to reset chat", e);
    }
  }
}

/* SIDE EFFECTS */

// Auto-scroll Effect:
// Whenever 'messages' or 'isLoading' updates, scroll to bottom.
$effect(() => {
  if ((messages.length > 0 || isLoading) && scrollContainer) {
    tick().then(() => {
      scrollContainer?.scrollTo({
        top: scrollContainer?.scrollHeight,
        behavior: "smooth",
      });
    });
  }
});
</script>

<style>
    @keyframes bounce-diagonal {
        0%, 100% {
            transform: translate(0, 0);
        }
        50% {
            transform: translate(-5px, -5px);
        }
    }
    .animate-bounce-diagonal {
        animation: bounce-diagonal 1.5s infinite ease-in-out;
    }
    @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
    }
</style>

<!-- 
  UI STRUCTURE 
-->

<!-- 1. Floating Toggle Button (Visible when chat is closed) -->
{#if !isOpen}
	<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 animate-in fade-in zoom-in duration-300">
		<!-- Callout Dialog with Glow and Bounce -->
		<div class="bg-white px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-neutral-100 flex items-center gap-3 animate-bounce duration-[2000ms] mb-2 mr-2">
			<div class="h-8 w-8 bg-black rounded-full flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                <div class="absolute inset-0 bg-white/20 animate-spin-slow" style="border-radius: 40%"></div>
				<Sparkles class="h-4 w-4 text-white relative z-10" />
			</div>
			<div class="flex flex-col">
				<span class="text-xs font-bold text-neutral-900">Aria</span>
				<span class="text-[10px] text-neutral-500 font-medium">Your specialist support agent</span>
			</div>
		</div>

        <!-- Dynamic Pointing Arrow -->
        <div class="mr-6 text-neutral-800 animate-bounce-diagonal">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-right drop-shadow-md"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>
        </div>

		<Button 
			size="icon" 
			class="h-14 w-14 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] bg-black hover:bg-neutral-800 text-white transition-transform hover:scale-110 ring-4 ring-black/10"
			onclick={() => (isOpen = true)}
			aria-label="Open Chat"
		>
			<MessageSquare class="h-6 w-6" />
		</Button>
	</div>
{/if}

<!-- 2. Main Chat Window (Visible when chat is open) -->
{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
		<!-- Backdrop click to close -->
		<button class="absolute inset-0 w-full h-full cursor-default" onclick={() => (isOpen = false)} aria-label="Close modal"></button>
		
		<div class="relative z-10 w-full max-w-2xl h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-200">
			
			<!-- A. Header Section -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white sticky top-0 z-10">
				<div class="flex items-center gap-4">
					<!-- Brand Icon -->
					<div class="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
						<Sparkles class="h-5 w-5" />
					</div>
					<!-- Brand Title -->
					<div class="flex flex-col">
						<h3 class="font-bold text-lg tracking-tight text-neutral-900">Aria</h3>
						<span class="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Archive 99 Support</span>

					</div>
				</div>
				<div class="flex items-center gap-1">
					<!-- Reset Button -->
					<Button variant="ghost" size="icon" class="h-10 w-10 rounded-full hover:bg-neutral-100 transition-colors" onclick={handleReset} title="New Chat">
						<RefreshCcw class="h-4 w-4 text-neutral-500" />
					</Button>
					<!-- Close Button -->
					<Button variant="ghost" size="icon" class="h-10 w-10 rounded-full hover:bg-neutral-100 transition-colors" onclick={() => (isOpen = false)}>
						<X class="h-5 w-5 text-neutral-500" />
					</Button>
				</div>
			</div>

		<!-- B. Messages Area (Scrollable) -->
		<!-- We use a native div here for better programmatic control of scrolling -->
		<div 
			class="flex-1 p-4 bg-neutral-50/50 overflow-y-auto" 
			bind:this={scrollContainer}
		>
			<!-- Empty State: Shown when there are no messages -->
			{#if messages.length === 0}
				<div class="flex h-full flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
					<div class="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
						<MessageSquare class="h-8 w-8 text-neutral-300" />
					</div>
					<div class="space-y-1">
						<p class="text-sm font-medium text-neutral-900">Welcome to Archive 99.</p>
						<p class="text-xs text-neutral-500 max-w-[200px] mx-auto">
							Ask about vintage sizing, authentications, or track your order.
						</p>
					</div>
				</div>
			{/if}

			<!-- Message List: Iterates over the messages array -->
			{#each messages as m, i (i)}
				<MessageBubble role={m.role} content={m.content} id={m.id} initialFeedback={m.feedback} />
			{/each}

			<!-- Loading Indicator: Shown when the AI is generating a response -->
			{#if isLoading}
				<div class="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2">
					<div class="bg-neutral-100 text-[10px] px-3 py-2 rounded-xl rounded-tl-none text-neutral-500 flex items-center gap-2 shadow-sm border border-neutral-200/50">
                        <Sparkles class="h-3 w-3 text-neutral-400 animate-spin-slow" />
						<span class="font-medium animate-pulse">Aria is thinking</span>
						<div class="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
						<div class="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
						<div class="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
					</div>
				</div>
			{/if}
		</div>

		<!-- C. Input Area (Footer) -->
		<div class="p-4 bg-white border-t border-neutral-100">
			<form onsubmit={handleSubmit} class="relative flex items-center">
				<Input 
					bind:value={inputValue} 
					placeholder="Type your question..." 
					class="pr-12 py-6 bg-neutral-50 border-neutral-200 focus-visible:ring-black rounded-xl shadow-inner text-sm"
					disabled={isLoading}
				/>
				<Button 
					type="submit" 
					size="icon" 
					class="absolute right-2 h-8 w-8 rounded-lg bg-black hover:bg-neutral-800 transition-all"
					disabled={isLoading || !inputValue.trim()}
				>
					<Send class="h-3 w-3 text-white" />
				</Button>
			</form>
			<div class="text-center mt-2">
				<span class="text-[9px] text-neutral-300 uppercase tracking-widest">Powered by Spur AI</span>
			</div>
		</div>
	</div>
	</div>

{/if}