import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { kahChat } from "@/lib/edge-functions";
import matangoIcon from "@/assets/matango-icon.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const KahChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm Ka'h, your AI marketing guide. Ask me anything about Matango.ai or AI-powered marketing." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await kahChat(msg, sessionId || undefined);
      setSessionId(res.session_id);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-900 text-gold-400 shadow-luxury hover:bg-emerald-800 transition-all flex items-center justify-center ring-2 ring-gold-500/30">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-emerald-900 border border-emerald-800/50 rounded-2xl flex flex-col shadow-luxury overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-emerald-800/50 bg-emerald-950/50">
            <div className="flex items-center gap-2">
              <img src={matangoIcon} alt="Matango" className="w-8 h-8 rounded-full ring-1 ring-gold-500/40 object-cover" />
              <div>
                <h4 className="text-sm font-semibold text-cream-50">Ka'h</h4>
                <p className="text-[10px] text-cream-100/40">Your AI Marketing Guide</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-emerald-800/50 text-cream-50"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-emerald-800/50 rounded-xl px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cream-100/40" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-emerald-800/50">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-lg border border-emerald-700/50 bg-emerald-800/30 px-3 py-2 text-sm text-cream-50 placeholder:text-cream-100/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                placeholder="Ask Ka'h anything..." />
              <button type="submit" disabled={loading || !input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default KahChatWidget;
