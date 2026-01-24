

// ✅ Node-compatible handler
import { answerFromSiteModel } from "../src/lib/chatEngine";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Use POST" }));
    return;
  }

  let body = "";
  req.on("data", (chunk: any) => (body += chunk));
  req.on("end", () => {
    try {
      const parsed = JSON.parse(body || "{}");
      const message = (parsed.message || "").trim();

      if (!message) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing message" }));
        return;
      }

      const reply = answerFromSiteModel(message);

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(reply));
    } catch (e: any) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: e.message || "Server error" }));
    }
  });
}
