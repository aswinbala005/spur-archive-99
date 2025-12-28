import {
  type FeatureExtractionPipeline,
  pipeline,
} from "@huggingface/transformers";

// Singleton: Store the model instance in memory so we only load it once
let instance: FeatureExtractionPipeline | null = null;

async function getInstance() {
  if (!instance) {
    console.log(
      "🔌 Initializing Local Embedding Model (Xenova/all-MiniLM-L6-v2)...",
    );
    // 'feature-extraction' task converts text to vectors
    instance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return instance;
}

const EmbeddingService = {
  async embed(text: string): Promise<number[]> {
    const generator = await getInstance();

    // pooling: 'mean' and normalize: true ensures the vector is ready for Cosine Similarity comparison
    const output = await generator(text, { pooling: "mean", normalize: true });

    // Convert Float32Array to standard number[] for Postgres compatibility
    return Array.from(output.data) as number[];
  },
};

export default EmbeddingService;
