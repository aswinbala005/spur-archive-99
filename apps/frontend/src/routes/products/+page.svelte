<script lang="ts">
import { onMount } from "svelte";
import { fade, fly } from "svelte/transition";

// Define product type matching our Backend API response
type Product = {
  id: number;
  name: string;
  slug: string;
  stock: number;
  isFinalSale: boolean;
  gender: string;
  color: string;
  brand: string;
  measurements: Record<string, string>;
};

let products: Product[] = [];
let loading = true;
let visible = false;

onMount(async () => {
  try {
    // Fetch from our new Backend API
    const res = await fetch("http://localhost:3000/products");
    products = await res.json();
  } catch (e) {
    console.error("Failed to load products:", e);
  } finally {
    loading = false;
    visible = true; // Trigger animations
  }
});

let selectedProduct: Product | null = null;

function openProduct(p: Product) {
  selectedProduct = p;
}

function closeProduct() {
  selectedProduct = null;
}

// Image Mapping (Slug -> Filename in /static/images)
// Note: In SvelteKit /static files are served at root /
const imageMap: Record<string, string> = {
  "stussy-hoodie-black": "/images/stussy-hoodie-black.png",
  "stussy-hoodie-grey": "/images/stussy-hoodie-grey.png",
  "akira-tee-1998": "/images/akira-tee-1998.png",
  "carhartt-detroit-moss": "/images/carhartt-detroit-moss.png",
  "helmut-lang-painter": "/images/helmut-lang-painter.png",
  "adidas-samba-white": "/images/adidas-samba-white.png",
  "adidas-samba-black": "/images/adidas-samba-black.png",
};

function getImageSrc(slug: string): string | null {
  return imageMap[slug] || null;
}

function getFallbackClass(slug: string, color: string): string {
  if (slug.includes("akira")) return "bg-neutral-800";
  if (slug.includes("moss")) return "bg-green-900";
  if (slug.includes("indigo")) return "bg-blue-900";
  if (color.toLowerCase().includes("black")) return "bg-neutral-900";
  if (color.toLowerCase().includes("grey")) return "bg-neutral-400";
  if (color.toLowerCase().includes("white"))
    return "bg-neutral-100 border border-neutral-200";
  return "bg-neutral-300";
}
</script>

<div class="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-24 md:px-12 md:py-32 relative">
	{#if visible}
		<div class="max-w-7xl mx-auto space-y-12">
			
			<!-- Header -->
			<header class="flex flex-col md:flex-row md:items-end justify-between gap-6" in:fly="{{ y: 20, duration: 1000 }}">
				<div>
					<span class="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 block mb-4">The Archive</span>
					<h1 class="text-4xl md:text-6xl font-black tracking-tighter">
						LATEST ARRIVALS
					</h1>
				</div>
				<a href="/" class="text-sm font-bold tracking-widest uppercase hover:text-neutral-500 transition-colors">
					← Back Home
				</a>
			</header>

			<!-- Product Grid -->
			{#if loading}
				<div class="py-20 text-center text-neutral-400 animate-pulse">Loading Inventory...</div>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each products as product, i}
						<button 
                            onclick={() => openProduct(product)}
							class="group bg-white p-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer text-left w-full"
							in:fly="{{ y: 40, duration: 800, delay: i * 100 }}"
						>
							<!-- Image Container -->
							<div class="aspect-[3/4] rounded-lg mb-6 relative overflow-hidden bg-neutral-100">
								
                                <!-- Real Image or Fallback -->
                                {#if getImageSrc(product.slug)}
                                    <img 
                                        src={getImageSrc(product.slug)} 
                                        alt={product.name}
                                        class="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                                    />
                                {:else}
                                    <div class={`w-full h-full ${getFallbackClass(product.slug, product.color)}`}></div>
                                {/if}

								<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
								
								<!-- Badges -->
								<div class="absolute top-4 left-4 flex flex-col gap-2">
									{#if product.stock === 0}
										<span class="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">Sold Out</span>
									{:else if product.stock < 3}
										<span class="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">Low Stock</span>
									{/if}
									
									{#if product.isFinalSale}
										<span class="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">Final Sale</span>
									{/if}
								</div>
							</div>

							<!-- Details -->
							<div class="space-y-1">
								<div class="flex justify-between items-start">
									<h3 class="text-lg font-bold leading-tight group-hover:underline decoration-1 underline-offset-4">
										{product.name}
									</h3>
									<!-- Price (Mocked based on generic logic) -->
									<span class="font-mono text-sm text-neutral-500">
										${product.brand === 'Vintage' ? 350 : product.brand === 'Helmut Lang' ? 450 : 200}
									</span>
								</div>
								
								<div class="flex items-center gap-2 text-xs text-neutral-500 font-medium uppercase tracking-wide pt-2">
									<span>{product.brand}</span>
									<span>•</span>
									<span>{product.gender}</span>
									<span>•</span>
									<span>{product.color}</span>
								</div>

								<!-- Measurements Preview -->
								{#if product.measurements}
									<div class="pt-4 mt-4 border-t border-neutral-100 text-xs text-neutral-400 font-mono">
										{#each Object.entries(product.measurements) as [key, val]}
											{#if key !== 'note'}
												<div class="flex justify-between">
													<span class="capitalize">{key.replace(/_/g, ' ')}</span>
													<span>{val}</span>
												</div>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

        <!-- Product Details Modal -->
        {#if selectedProduct}
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
                <!-- Backdrop -->
                <button 
                    class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 w-full h-full border-0 cursor-default"
                    onclick={closeProduct}
                    aria-label="Close Details"
                    type="button"
                ></button>

                <!-- Modal Panel -->
                <div class="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-500 pointer-events-auto" role="dialog" aria-modal="true">
                    
                    <!-- Close Button -->
                    <button class="absolute top-6 right-6 z-10 p-2 bg-white/80 rounded-full hover:bg-black hover:text-white transition-colors" onclick={closeProduct} aria-label="Close Modal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                     <!-- Col 1: Image (Full Height) -->
                    <div class="bg-neutral-100 relative h-64 md:h-auto">
                        {#if getImageSrc(selectedProduct.slug)}
                            <img 
                                src={getImageSrc(selectedProduct.slug)} 
                                alt={selectedProduct.name}
                                class="w-full h-full object-cover object-center"
                            />
                        {:else}
                            <div class={`w-full h-full ${getFallbackClass(selectedProduct.slug, selectedProduct.color)}`}></div>
                        {/if}
                    </div>

                    <!-- Col 2: Details (Scrollable) -->
                    <div class="p-8 md:p-12 overflow-y-auto flex flex-col h-full bg-white">
                         <div class="mb-auto">
                             <div class="flex items-center gap-2 mb-6">
                                <span class="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500">{selectedProduct.brand}</span>
                                {#if selectedProduct.stock < 3 && selectedProduct.stock > 0}
                                    <span class="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded">Low Stock</span>
                                {/if}
                             </div>
                             
                             <h2 class="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-none">{selectedProduct.name}</h2>
                             
                             <p class="text-2xl font-mono text-neutral-600 mb-8">
                                ${selectedProduct.brand === 'Vintage' ? 350 : selectedProduct.brand === 'Helmut Lang' ? 450 : 200}
                             </p>

                             <div class="space-y-6 text-neutral-600 leading-relaxed max-w-md">
                                 <p>
                                     An authentic archival piece sourced from our private network. 
                                     This item has been professionally cleaned and inspected for authenticity.
                                 </p>
                                 <p class="text-sm">
                                     <strong class="text-black">Condition:</strong> Vintage Pre-owned. Expect natural wear and distressing consistent with age.
                                 </p>
                             </div>

                             <!-- Measurements Table -->
                             {#if selectedProduct.measurements}
                                <div class="mt-8 pt-8 border-t border-neutral-100">
                                    <h3 class="font-bold text-sm uppercase tracking-widest mb-4">Measurements</h3>
                                    <div class="grid grid-cols-2 gap-4 text-sm font-mono text-neutral-500">
                                        {#each Object.entries(selectedProduct.measurements) as [key, val]}
                                            {#if key !== 'note'}
                                                <div class="flex flex-col">
                                                    <span class="capitalize text-neutral-300 text-xs">{key.replace(/_/g, ' ')}</span>
                                                    <span class="text-black">{val}</span>
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                    {#if selectedProduct.measurements.note}
                                        <p class="mt-4 text-xs text-neutral-400 italic">
                                            * {selectedProduct.measurements.note}
                                        </p>
                                    {/if}
                                </div>
                            {/if}
                         </div>

                         <!-- Footer Actions -->
                         <div class="pt-8 mt-8 border-t border-neutral-100">
                            {#if selectedProduct.stock > 0}
                                <button class="w-full py-4 bg-black text-white font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors">
                                    Add to Cart
                                </button>
                            {:else}
                                <button disabled class="w-full py-4 bg-neutral-200 text-neutral-400 font-bold tracking-widest uppercase cursor-not-allowed">
                                    Sold Out
                                </button>
                            {/if}
                            <p class="text-center text-[10px] text-neutral-400 mt-4 uppercase tracking-wider">
                                {selectedProduct.isFinalSale ? 'Final Sale • No Returns' : 'Returns accepted within 7 days'}
                            </p>
                         </div>
                    </div>
                </div>
            </div>
        {/if}
	{/if}
</div>
