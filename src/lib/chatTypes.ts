/**
 * Shared chat types used by both:
 * - Online (RAG API)
 * - Offline (siteModel rules)
 */

export type QuickAction = { label: string; message: string };

export type ChatReply = {
  answer: string;
  quickActions?: QuickAction[];
};
