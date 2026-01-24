import { pipeline } from "@xenova/transformers";

/**
 * Cached promise for the embedding model
 * We cache this to avoid loading the model multiple times, which is slow and wasteful
 */
let extractorPromise: ReturnType<typeof pipeline> | null = null;

/**
 * Get or initialize the embedding model
 * 
 * Why we use this:
 * - Lazy loads the model only when first needed
 * - Caches the model for subsequent calls to avoid repeated downloads/initialization
 * - Uses "all-MiniLM-L6-v2" - a small, fast model that creates 384-dimensional embeddings
 * 
 * @returns Promise resolving to the feature extraction pipeline
 */
async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
}

/**
 * Normalize a vector to unit length (L2 normalization)
 * 
 * Why we use this:
 * - Normalized vectors allow us to use cosine similarity for search
 * - Cosine similarity measures the angle between vectors, not their magnitude
 * - This makes embeddings comparable regardless of their original scale
 * - Formula: divide each element by the vector's magnitude (||v|| = sqrt(sum(v_i^2)))
 * 
 * @param vec - The input vector to normalize
 * @returns Unit-length vector (magnitude = 1)
 */
function toUnit(vec: number[]) {
  // Calculate sum of squares
  let sum = 0;
  for (const v of vec) sum += v * v;
  
  // Calculate magnitude (with fallback to 1 to avoid division by zero)
  const norm = Math.sqrt(sum) || 1;
  
  // Divide each element by the magnitude
  return vec.map((v) => v / norm);
}

/**
 * Convert text strings into embeddings (numerical vectors)
 * 
 * Why we use this:
 * - Embeddings capture semantic meaning of text in numerical form
 * - Similar texts have similar embeddings (measured by cosine similarity)
 * - This enables semantic search: find documents by meaning, not just keywords
 * - For example, "JavaScript developer" and "frontend engineer" would have similar embeddings
 * 
 * How it works:
 * 1. Pass text through the transformer model
 * 2. Use mean pooling to combine token embeddings into one sentence embedding
 * 3. Normalize to unit length for cosine similarity search
 * 
 * @param texts - Array of text strings to embed
 * @returns Promise resolving to array of embedding vectors (each is 384 dimensions)
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const out: number[][] = [];

  for (const t of texts) {
    // Run the model with mean pooling to get a single vector per text
    const res: any = await extractor(t, { pooling: "mean" } as any);
    
    // Convert Float32Array to regular number array
    const arr = Array.from(res.data as Float32Array).map(Number);
    
    // Normalize to unit length and add to output
    out.push(toUnit(arr));
  }
  return out;
}