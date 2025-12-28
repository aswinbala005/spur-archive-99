<script lang="ts">
import { onMount } from "svelte";
import { fade, fly } from "svelte/transition";

let visible = false;

onMount(() => {
  visible = true;
});
</script>

<div class="min-h-screen bg-white text-neutral-900 px-6 py-24 md:px-12 md:py-32">
  {#if visible}
    <div class="max-w-4xl mx-auto space-y-24">
      
      <!-- Header Section -->
      <section in:fly="{{ y: 20, duration: 1000, delay: 0 }}">
        <span class="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 block mb-6">About Us</span>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
          PRESERVING<br/>THE CULTURE.
        </h1>
        <p class="text-xl md:text-2xl font-light text-neutral-600 leading-relaxed max-w-2xl">
          Archive 99 isn't just a store. It's a digital museum of streetwear history. 
          We source, authenticate, and curate the rarest pieces from the 90s and early 2000s.
        </p>
      </section>

      <!-- How It Works Grid -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-neutral-200 pt-24" in:fly="{{ y: 20, duration: 1000, delay: 200 }}">
        
        <div class="space-y-4">
          <h3 class="text-2xl font-bold">Online Only</h3>
          <p class="text-neutral-500 leading-relaxed">
            We operate out of a secure, private warehouse facility in Tokyo, Japan. 
            To maintain the security of our inventory and staff, we do not have a physical storefront open to the public. 
            Everything is shipped directly to your door via DHL Express.
          </p>
        </div>

        <div class="space-y-4">
          <h3 class="text-2xl font-bold">100% Authentic</h3>
          <p class="text-neutral-500 leading-relaxed">
            Every single item is rigorously inspected by our in-house experts. 
            We check stitch counts, fabric weight, print quality, and hardware against our archival database. 
            We do not sell fakes. Ever.
          </p>
        </div>

        <div class="space-y-4">
          <h3 class="text-2xl font-bold">The Sourcing</h3>
          <p class="text-neutral-500 leading-relaxed">
            We don't buy from the public. Our inventory comes exclusively from a closed network of 
            private collectors and archival houses in Japan, Europe, and the US.
          </p>
        </div>

        <div class="space-y-4">
          <h3 class="text-2xl font-bold">The "Drop" Model</h3>
          <p class="text-neutral-500 leading-relaxed">
            New items are released in curated "Drops" on Fridays. 
            Because every item is 1-of-1 vintage, once it's gone, it's gone forever.
          </p>
        </div>

      </section>

      <!-- Back Link -->
      <div class="pt-12" in:fade="{{ duration: 1000, delay: 500 }}">
        <a href="/" class="text-sm font-bold tracking-widest uppercase hover:text-neutral-500 transition-colors">
          ← Back Home
        </a>
      </div>

    </div>
  {/if}
</div>
