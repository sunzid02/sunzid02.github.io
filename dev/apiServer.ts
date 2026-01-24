import http from "node:http";
import "dotenv/config";
import { answerWithRag } from "../src/lib/rag/ragAnswer";

const PORT = 8787;

http
  .createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/api/chat") {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const message = (parsed?.message || "").toString().trim();

        if (!message) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing message" }));
          return;
        }

        const reply = await answerWithRag(message);

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(reply));
      } catch (e: any) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: e?.message || "Server error" }));
      }
    });
  })
  .listen(PORT, () => console.log(`Local API: http://localhost:${PORT}`));
