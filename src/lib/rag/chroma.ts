import { ChromaClient } from "chromadb";

/**
 * Initialize ChromaDB client
 * ChromaDB is a vector database that stores embeddings (numerical representations of text)
 * and allows us to search for similar text based on semantic meaning.
 * We use host/port instead of the deprecated 'path' argument.
 */
export const chroma = new ChromaClient({ 
  host: "localhost",
  port: 8000,
});

/**
 * Get or create the ChromaDB collection for storing portfolio knowledge
 * A collection is like a table in a traditional database - it holds our embedded documents.
 * We don't specify an embeddingFunction because we're generating embeddings ourselves
 * using the Xenova transformers model (see embed.ts).
 * 
 * @returns Promise resolving to the ChromaDB collection instance
 */
export async function getCollection() {
  const name = process.env.RAG_COLLECTION || "portfolio_kb";
  return chroma.getOrCreateCollection({ 
    name,
    // Don't specify embeddingFunction since you're providing embeddings directly
  });
}