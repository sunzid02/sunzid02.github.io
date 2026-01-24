import "dotenv/config";
import OpenAI from "openai";
import { getCollection } from "./chroma";
import { embedTexts } from "./embed";

/**
 * Initialize Groq API client
 * Groq provides fast inference for LLMs (Large Language Models)
 * We use it with OpenAI's SDK by pointing to Groq's base URL
 */
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Answer a user question using RAG (Retrieval-Augmented Generation)
 * 
 * What is RAG?
 * - Retrieval: Find relevant documents from our knowledge base
 * - Augmented: Add those documents as context to the LLM
 * - Generation: LLM generates an answer based on the provided context
 * 
 * Why we use this:
 * - Prevents hallucinations: LLM answers only from provided sources
 * - Always up-to-date: Knowledge base contains current information
 * - Grounded responses: Every answer is backed by actual documents
 * - Privacy: Sensitive info stays in our database, not in LLM training data
 * 
 * How it works:
 * 1. Convert user question to an embedding vector
 * 2. Search ChromaDB for similar document chunks (cosine similarity)
 * 3. Retrieve top 6 most relevant chunks
 * 4. Send question + retrieved context to LLM
 * 5. LLM generates answer based only on provided context
 * 6. Return answer with source attribution
 * 
 * @param userMessage - The user's question
 * @returns Object containing the answer and sources used
 */
export async function answerWithRag(userMessage: string) {
  // Get the ChromaDB collection
  const collection = await getCollection();

  // Convert user question into an embedding vector
  // This allows us to search for semantically similar documents
  const [qEmbed] = await embedTexts([userMessage]);

  // Query ChromaDB for the 6 most similar document chunks
  // Using cosine similarity between question embedding and document embeddings
  const results = await collection.query({
    queryEmbeddings: [qEmbed],
    nResults: 6, // Retrieve top 6 most relevant chunks
    include: ["documents", "metadatas", "distances"],
  });

  // Format the retrieved documents with metadata
  const docs = (results.documents?.[0] || []).map((text, i) => ({
    text,
    meta: (results.metadatas?.[0] || [])[i],
    distance: (results.distances?.[0] || [])[i], // Lower distance = more similar
  }));

  // Combine all retrieved chunks into a single context string
  // Each chunk is labeled with its source for attribution
  const context = docs
    .map((d, i) => `Source ${i + 1} (${d?.meta?.source || "unknown"}):\n${d.text}`)
    .join("\n\n");

  // System prompt: Instructions for the LLM on how to behave
  // Critical rules:
  // - Only use provided sources (prevents hallucination)
  // - Don't reveal sensitive information
  // - Be concise and helpful
  const system = [
    "You are a helpful assistant embedded in Sarker Sunzid Mahmud's portfolio.",
    "Use ONLY the provided sources to answer.",
    "If the sources do not contain the answer, say you do not know.",
    "Do not reveal private or sensitive info like phone, address, secrets, tokens.",
    "Keep it friendly and concise.",
  ].join("\n");

  // Call the LLM with the question and retrieved context
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // Fast, efficient model from Meta
    temperature: 0.2, // Low temperature = more focused, deterministic responses
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Question:\n${userMessage}\n\nSources:\n${context}` },
    ],
  });

  // Extract the LLM's answer
  const answer = completion.choices[0]?.message?.content?.trim() || "No answer.";

  // Return top 4 sources for attribution/transparency
  const sources = docs.slice(0, 4).map((d) => ({
    source: d?.meta?.source || "unknown",
    part: d?.meta?.part,
  }));

  return { answer, sources };
}