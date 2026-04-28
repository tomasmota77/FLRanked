"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  user: string;
  content: string;
  time: string;
}

interface ChatProps {
  roomId: string;
  messages: Message[];
  onMessageSent?: () => void;
}

export default function Chat({ roomId, messages, onMessageSent }: ChatProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    const count = messages.length;
    if (count > prevMessageCount.current) {
      const container = chatContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom || prevMessageCount.current === 0) {
          // Use scrollTop instead of scrollIntoView to avoid window scrolling
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 100);
        }
      }
      prevMessageCount.current = count;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    const text = newMessage.trim();
    setNewMessage("");

    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        onMessageSent?.();
      } else {
        setNewMessage(text);
      }
    } catch (err) {
      setNewMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-text-tertiary" />
        Live Chat
      </h3>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">
            No messages yet.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-purple/50 to-neon-green/50 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                {msg.user[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${msg.user === session?.user?.name ? "text-neon-green" : "text-white"}`}>
                    {msg.user}
                  </span>
                  <span className="text-xs text-text-tertiary">{msg.time}</span>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm transition-all"
          disabled={isSending}
        />
        <button
          onClick={sendMessage}
          disabled={isSending || !newMessage.trim()}
          className="btn-neon !py-2.5 !px-4 disabled:opacity-50"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
