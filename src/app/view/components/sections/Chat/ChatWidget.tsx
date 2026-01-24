import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "bot"; text: string };
type QuickAction = { label: string; message: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hey! Ask me about my profile, skills, experience, projects, or contact." },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollDown = () => {
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  };

  useEffect(() => {
    if (open) scrollDown();
  }, [open]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;

    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    setQuickActions([]);
    scrollDown();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setMessages((m) => [...m, { role: "bot", text: data.answer || "No answer" }]);
      setQuickActions(Array.isArray(data.quickActions) ? data.quickActions : []);
      setLoading(false);
      scrollDown();
    } catch (e: any) {
      setLoading(false);
      setMessages((m) => [...m, { role: "bot", text: `Error: ${e?.message || "Unknown"}` }]);
      scrollDown();
    }
  };

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999 }}>
      {open && (
        <div
          style={{
            width: 340,
            height: 460,
            background: "rgba(10, 15, 25, 0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid rgba(255,255,255,0.10)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>Portfolio Assistant</div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 10,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              padding: 12,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  color: "white",
                  background: m.role === "user" ? "rgba(0, 102, 255, 0.35)" : "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  lineHeight: 1.35,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "88%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  color: "white",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                Typing...
              </div>
            )}
          </div>

          {quickActions.length > 0 && (
            <div style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => send(a.message)}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 999,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              style={{ display: "flex", gap: 8 }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0, 102, 255, 0.35)",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(0, 102, 255, 0.42)",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          fontWeight: 800,
        }}
        aria-label="Open assistant"
      >
        AI
      </button>
    </div>
  );
}
