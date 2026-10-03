"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  MessageSquareDashed,
  Sparkles,
  Smile,
  UserX,
  SkipForward,
  Loader2,
  Reply,
  X,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { socket } from "@/lib/socket";
import { SOCKET_EVENTS } from "@/servers/socket/events";

type Props = {
  params: Promise<{
    roomId: string;
  }>;
};

type ReplyPayload = {
  id: string;
  sender: string;
  message: string;
};

type Message = {
  id: string;
  sender: string;
  message: string;
  createdAt: number;
  replyTo?: ReplyPayload | null;
};

// Categorized Emoji Collection
const EMOJI_CATEGORIES = [
  {
    name: "Popular",
    emojis: ["👋", "😂", "🔥", "👍", "❤️", "😮", "😍", "🤣", "😊", "😭", "🙏", "😎", "🥳", "🤔", "🥺", "🥰", "🙌", "💯"],
  },
  {
    name: "Gestures",
    emojis: ["👏", "🤝", "✌️", "🫡", "👎", "👊", "🤞", "🤟", "👈", "👉", "👆", "👇", "💪", "✍️", "🖐️"],
  },
  {
    name: "Hearts",
    emojis: ["❤️", "💖", "💙", "💚", "💛", "💜", "🤍", "🖤", "💔", "💗", "💘", "💌", "💕", "💓", "💞"],
  },
  {
    name: "Fun",
    emojis: ["⚡", "✨", "🎉", "🚀", "💡", "🎯", "⭐", "🎁", "🎈", "💎", "🏆", "🔥", "👑", "🧿", "💬"],
  },
];

export default function ChatPage({ params }: Props) {
  const router = useRouter();

  // Dynamic params
  const { roomId } = use(params);

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategoryIndex, setEmojiCategoryIndex] = useState(0);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [isSearchingNext, setIsSearchingNext] = useState(false);

  // Reply State
  const [replyingTo, setReplyingTo] = useState<ReplyPayload | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket Lifecycle
  useEffect(() => {
    if (!roomId) return;

    function handleConnect() {
      console.log(" Connected to socket, joining room:", roomId);
      socket.emit("join-room", roomId);
    }

    function handleIncomingMessage(data: Message) {
      setMessages((prev) => {
        const isDuplicate = prev.some((msg) => msg.id === data.id);
        if (isDuplicate) return prev;
        return [...prev, data];
      });
    }

    function handleMatchFound(data: { roomId: string }) {
      setIsSearchingNext(false);
      router.push(`/chat/${data.roomId}`);
    }

    function handleMessageDeleted(data: { messageId: string }) {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    }

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("message", handleIncomingMessage);
    socket.on(SOCKET_EVENTS.MATCH_FOUND, handleMatchFound);
    socket.on("message-deleted", handleMessageDeleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("message", handleIncomingMessage);
      socket.off(SOCKET_EVENTS.MATCH_FOUND, handleMatchFound);
      socket.off("message-deleted", handleMessageDeleted);
      socket.emit("leave-room", roomId);
    };
  }, [roomId, router]);

  // Send Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    const newMessage: Message & { roomId: string } = {
      id: crypto.randomUUID(),
      roomId,
      sender: socket.id || "Self",
      message: trimmedMessage,
      createdAt: Date.now(),
      replyTo: replyingTo ? { ...replyingTo } : null,
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send-message", newMessage);

    setInputMessage("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  // Delete Message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    socket.emit("delete-message", { roomId, messageId });
  };

  // Copy Message Text
  const handleCopyMessage = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(messageId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleNextStranger = () => {
    setIsSearchingNext(true);
    socket.emit("leave-room", roomId);

    const token = localStorage.getItem("token");
    socket.emit(SOCKET_EVENTS.START_CHAT, {
      token,
      chatType: "text",
      gender: "any",
      isGuest: false,
    });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", roomId);
    router.push("/dashboard");
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const filteredEmojis = emojiSearch.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) => e.includes(emojiSearch.trim()))
    : EMOJI_CATEGORIES[emojiCategoryIndex].emojis;

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-100/70 blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-violet-100/60 blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 sm:h-10 sm:w-10"
            title="Dashboard"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                Live Chat
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-xs">
                <ShieldCheck className="h-3 w-3" /> Encrypted
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-mono text-slate-500 sm:text-xs">
                Room:{" "}
                <span className="font-semibold text-slate-700">
                  {roomId.length > 10 ? `${roomId.slice(0, 8)}...` : roomId}
                </span>
              </p>
              <button
                onClick={handleCopyRoomId}
                className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Copy Room ID"
              >
                {copiedRoomId ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Feed */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4 sm:px-6 sm:py-6 md:px-8">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white text-indigo-600 shadow-xl backdrop-blur-xl sm:h-20 sm:w-20">
              <div className="absolute inset-0 animate-pulse rounded-3xl bg-indigo-50 blur-xl" />
              <MessageSquareDashed className="relative h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-slate-900 sm:text-lg">
              You are connected with a stranger!
            </h3>
            <p className="mt-1 max-w-xs text-xs font-medium text-slate-500 sm:max-w-sm sm:text-sm">
              Say hi! Hover or tap any message to <b>Reply, Copy, or Delete</b>.
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" /> Start typing below
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === socket.id;

            return (
              <div
                key={`${msg.id}-${index}`}
                className={`group relative flex items-center gap-1 sm:gap-2 ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Chat Bubble */}
                <div
                  className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md transition-all sm:max-w-md sm:px-4 sm:py-3 ${
                    isMe
                      ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-br-xs shadow-indigo-600/10"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-slate-200/50"
                  }`}
                >
                  {!isMe && (
                    <p className="mb-1 text-[10px] font-mono font-bold tracking-wider text-indigo-600 uppercase">
                      Stranger ({msg.sender.slice(0, 5)})
                    </p>
                  )}

                  {/* Quoted Message Preview Box */}
                  {msg.replyTo && (
                    <div
                      className={`mb-2 rounded-xl p-2 text-xs border-l-2 ${
                        isMe
                          ? "bg-black/10 border-white/70 text-indigo-50"
                          : "bg-slate-100 border-indigo-600 text-slate-600"
                      }`}
                    >
                      <p className="font-bold text-[10px] opacity-80">
                        {msg.replyTo.sender === socket.id ? "You" : "Stranger"}
                      </p>
                      <p className="truncate line-clamp-1 italic text-[11px]">
                        "{msg.replyTo.message}"
                      </p>
                    </div>
                  )}

                  <p className="leading-relaxed break-words font-medium text-xs sm:text-sm">
                    {msg.message}
                  </p>

                  <p
                    className={`mt-1 text-[9px] font-mono text-right sm:text-[10px] ${
                      isMe ? "text-indigo-100/80" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Quick Action Overlay (Reply, Copy, Delete) */}
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    onClick={() => handleCopyMessage(msg.message, msg.id)}
                    className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy message"
                  >
                    {copiedMsgId === msg.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setReplyingTo({
                        id: msg.id,
                        sender: msg.sender,
                        message: msg.message,
                      })
                    }
                    className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Reply to message"
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-1.5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Controls & Input Form Container */}
      <div className="relative z-20 border-t border-slate-200/80 bg-white/90 p-3 backdrop-blur-md sm:p-4 md:px-8">
        
        {/* Full Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-24 left-4 z-50 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex gap-1">
                {EMOJI_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setEmojiCategoryIndex(idx);
                      setEmojiSearch("");
                    }}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                      emojiCategoryIndex === idx && !emojiSearch
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1">
              {filteredEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddEmoji(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-lg transition-all hover:bg-slate-100 active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Reply Preview Bar */}
        {replyingTo && (
          <div className="mx-auto mb-2 flex max-w-5xl items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-hidden">
              <Reply className="h-4 w-4 text-indigo-600 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-indigo-700">
                  Replying to {replyingTo.sender === socket.id ? "Yourself" : "Stranger"}
                </span>
                <p className="truncate text-slate-600 text-[11px] font-normal">
                  "{replyingTo.message}"
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Action Row & Form Integration */}
        <div className="mx-auto flex max-w-5xl flex-col gap-2.5">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Emoji Toggle */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all sm:h-12 sm:w-12 ${
                showEmojiPicker
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-900"
              }`}
              title="Emoji Picker"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Text Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:px-5 sm:py-3.5 sm:text-sm font-medium"
                placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:active:scale-100 sm:h-12 sm:w-12"
              title="Send Message"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* DESKTOP ONLY: Next & Leave Controls at Bottom */}
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={handleNextStranger}
                disabled={isSearchingNext}
                className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
              >
                {isSearchingNext ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SkipForward className="h-4 w-4" />
                )}
                <span>{isSearchingNext ? "Matching..." : "Next Stranger"}</span>
              </button>

              <button
                type="button"
                onClick={handleLeaveRoom}
                className="flex h-12 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-95"
              >
                <UserX className="h-4 w-4" />
                <span>Leave</span>
              </button>
            </div>
          </form>

          {/* MOBILE ONLY: Swap & Leave Action Buttons Below Bar */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <button
              type="button"
              onClick={handleNextStranger}
              disabled={isSearchingNext}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSearchingNext ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>{isSearchingNext ? "Swapping..." : "Swap Stranger"}</span>
            </button>

            <button
              type="button"
              onClick={handleLeaveRoom}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 transition-all active:scale-95"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Leave Chat</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}