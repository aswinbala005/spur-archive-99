<script lang="ts">
// 1. Import Global Styles (Tailwind CSS)
// This file contains the CSS variables and base styles for the entire application.
import "../app.css";
import ChatWidget from "$lib/components/chat/ChatWidget.client.svelte";

// 3. Svelte 5 Props
// 'children' is a special prop in layouts that represents the content of the
// specific page being rendered (e.g., +page.svelte). We use 'let' as is standard for props.
const { children } = $props();
</script>

<!-- 
	LAYOUT STRUCTURE 
	This is the master template for every page on the site.
-->

<!-- Main Content Area -->
<!-- This div wraps the page content, providing a consistent background and font. -->
<div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans selection:bg-black selection:text-white">
	<!-- Render the specific page content here using the modern Svelte 5 snippet syntax -->
	{@render children()}
</div>

<!-- Global Overlays -->
<!-- The ChatWidget lives here, outside the main flow. This ensures it:
	- Persists across page navigations.
	- Floats on top of all other content due to its high z-index.
-->
<div class="fixed bottom-0 right-0 z-[100]">
	<ChatWidget />
</div>