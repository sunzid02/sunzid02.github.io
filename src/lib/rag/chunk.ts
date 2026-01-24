/**
 * Split large text into smaller, overlapping chunks
 * 
 * Why we use this:
 * - Language models have context limits, so we can't embed entire documents at once
 * - Smaller chunks create more precise embeddings for semantic search
 * - Overlapping chunks ensure important information at chunk boundaries isn't lost
 * - When a user asks a question, we retrieve the most relevant chunks instead of entire documents
 * 
 * @param text - The input text to chunk
 * @param chunkSize - Maximum characters per chunk (default: 1100)
 * @param overlap - Number of characters to overlap between chunks (default: 200)
 * @returns Array of text chunks
 */
export function chunkText(text: string, chunkSize = 1100, overlap = 200) {
  // Normalize whitespace - replace multiple spaces/newlines with single space
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];

  let i = 0;
  while (i < clean.length) {
    // Get the end position (either chunkSize ahead or end of text)
    const end = Math.min(i + chunkSize, clean.length);
    
    // Extract the chunk from current position to end
    chunks.push(clean.slice(i, end));
    
    // If we've reached the end, stop
    if (end === clean.length) break;
    
    // Move forward, but step back by 'overlap' to create overlapping chunks
    // This ensures context continuity between chunks
    i = Math.max(0, end - overlap);
  }
  return chunks;
}