import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

import { chunkText } from "./chunk";
import { embedTexts } from "./embed";
import { getCollection, chroma } from "./chroma";

/**
 * Extract text content from a PDF file
 * 
 * Why we use this:
 * - PDF files contain binary data, not plain text
 * - pdf-parse library extracts the readable text from PDF structure
 * - This allows us to embed and search the resume content
 * 
 * Note: We use CommonJS require() because pdf-parse doesn't have proper ESM exports
 * 
 * @param pdfPath - Path to the PDF file
 * @returns Extracted text content from the PDF
 */
async function readResumeText(pdfPath: string) {
  // Read PDF as binary buffer
  const buf = fs.readFileSync(pdfPath);
  
  // pdf-parse is a CommonJS module, so we need to use require
  const pdfParse = require("pdf-parse");
  const parsed = await pdfParse(buf);
  
  return (parsed.text || "").trim();
}

/**
 * Main ingestion pipeline: Process documents and store them in ChromaDB
 * 
 * What this does:
 * 1. Deletes any existing collection (to avoid embedding function conflicts)
 * 2. Creates a new collection
 * 3. Reads source documents (siteModel.ts and resume PDF)
 * 4. Chunks the documents into smaller pieces
 * 5. Generates embeddings for each chunk
 * 6. Stores chunks with their embeddings in ChromaDB for semantic search
 * 
 * Why we use this:
 * - This is a one-time setup process (run when documents change)
 * - Prepares the knowledge base for the RAG (Retrieval-Augmented Generation) system
 * - The stored embeddings enable fast semantic search at query time
 */
async function main() {
  // Delete the old collection if it exists
  // This is necessary because the old collection might have been created with
  // the default embedding function, which conflicts with our custom embeddings
  const collectionName = process.env.RAG_COLLECTION || "portfolio_kb";
  try {
    await chroma.deleteCollection({ name: collectionName });
    console.log(`Deleted old collection: ${collectionName}`);
  } catch (e) {
    console.log("No existing collection to delete (this is fine for first run)");
  }

  // Get or create the collection (will be fresh after deletion above)
  const collection = await getCollection();

  // Define paths to source documents
  const siteModelPath = path.join(process.cwd(), "src", "app", "model", "siteModel.ts");

  const resumePath = path.join(
    process.cwd(),
    "public",
    "resume",
    "Resume_Sarker_Sunzid_Mahmud.pdf"
  );

  // Verify files exist before processing
  if (!fs.existsSync(siteModelPath)) {
    throw new Error(`siteModel.ts not found at: ${siteModelPath}`);
  }
  if (!fs.existsSync(resumePath)) {
    throw new Error(`Resume PDF not found at: ${resumePath}`);
  }

  // Read the source documents
  const siteText = fs.readFileSync(siteModelPath, "utf8");
  const resumeText = await readResumeText(resumePath);

  // Prepare array to hold all document chunks with metadata
  const docs: { id: string; text: string; meta: any }[] = [];

  // Chunk the site model and add to docs array
  chunkText(siteText).forEach((c, idx) => {
    docs.push({ 
      id: `siteModel_${idx}`, 
      text: c, 
      meta: { source: "siteModel.ts", part: idx } 
    });
  });

  // Chunk the resume and add to docs array
  chunkText(resumeText).forEach((c, idx) => {
    docs.push({ 
      id: `resume_${idx}`, 
      text: c, 
      meta: { source: "Resume.pdf", part: idx } 
    });
  });

  // Process documents in batches to avoid overwhelming the embedding model
  const batchSize = 24;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    
    // Generate embeddings for this batch of text chunks
    const embeddings = await embedTexts(batch.map((d) => d.text));

    // Store in ChromaDB: ids, text, metadata, and embeddings
    await collection.upsert({
      ids: batch.map((d) => d.id),
      documents: batch.map((d) => d.text),
      metadatas: batch.map((d) => d.meta),
      embeddings,
    });

    console.log(`Upserted ${Math.min(i + batchSize, docs.length)}/${docs.length}`);
  }

  console.log("Done. Knowledge base is ready for queries!");
}

// Run the ingestion process
main().catch((e) => {
  console.error(e);
  process.exit(1);
});