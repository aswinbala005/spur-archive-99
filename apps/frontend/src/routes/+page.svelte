<script lang="ts">
// No script needed for this static visual component
</script>

<!-- 
	LANDING PAGE VISUALS 
	Using Tailwind CSS for a minimalist, high-end streetwear aesthetic.
-->
<div class="flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6 lg:px-8 text-center">
	
	<!-- Brand Header -->
	<div class="space-y-6 max-w-3xl">
		<!-- Badge -->
		<div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
			<span class="inline-block px-3 py-1 bg-neutral-200/50 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600 rounded-full border border-neutral-200">
				Est. 1999 • Tokyo
			</span>
		</div>

		<!-- Title -->
		<h1 class="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-neutral-900 animate-in fade-in zoom-in duration-1000 delay-100">
			ARCHIVE 99
		</h1>

		<!-- Subtitle -->
		<p class="text-lg md:text-2xl text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
			Curated vintage streetwear. Authenticated. Rare.
			<br class="hidden md:block" />
			<span class="text-neutral-900 font-medium">Strictly for the collectors.</span>
		</p>
	</div>

	<!-- Call to Action Buttons (Mock) -->
	<div class="flex flex-col sm:flex-row gap-4 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
		<a href="/about" class="px-8 py-4 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-neutral-200">
			About
		</a>
		<a href="/products" class="px-8 py-4 bg-white border border-neutral-200 text-neutral-900 font-medium rounded-full hover:border-neutral-400 transition-all hover:bg-neutral-50">
			Products
		</a>
	</div>

	<!-- Background Decoration -->
	<div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
		<div class="absolute top-[20%] left-[20%] w-96 h-96 bg-neutral-200/20 rounded-full blur-3xl"></div>
		<div class="absolute bottom-[20%] right-[20%] w-96 h-96 bg-neutral-200/30 rounded-full blur-3xl"></div>
	</div>
</div>