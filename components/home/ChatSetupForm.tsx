"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mars, Venus, Video, Check } from "lucide-react";

import { socket } from "@/lib/socket";
import { SOCKET_EVENTS } from "@/servers/socket/events";
import { getCurrentUser } from "@/lib/auth";

export default function ChatSetupForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("male");
  const [searching, setSearching] = useState(false);
  const [chatType, setChatType] = useState<"text" | "video">("text");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Socket Connected:", socket.id);
    };

    const handleWaiting = () => {
      setSearching(true);
    };

    const handleMatchFound = ({ roomId }: { roomId: string }) => {
      setSearching(false);

      router.push(
        chatType === "video"
          ? `/video/${roomId}`
          : `/chat/${roomId}`
      );
    };

    socket.on("connect", handleConnect);
    socket.on(SOCKET_EVENTS.WAITING, handleWaiting);
    socket.on(SOCKET_EVENTS.MATCH_FOUND, handleMatchFound);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(SOCKET_EVENTS.WAITING, handleWaiting);
      socket.off(SOCKET_EVENTS.MATCH_FOUND, handleMatchFound);
    };
  }, [router, chatType]);

  const startChat = (mode: "text" | "video") => {
    if (searching || !agreedToTerms) return;

    setChatType(mode);

    const currentUser = getCurrentUser();

    const guestName = username.trim() || "Guest";

    setSearching(true);

    socket.emit(SOCKET_EVENTS.START_CHAT, {
      token: currentUser.token,
      userId: currentUser.userId,
      username: currentUser.isGuest
        ? guestName
        : currentUser.username,
      gender,
      type: mode,
      isGuest: currentUser.isGuest,
    });
  };

  return (
    <div className="w-full">

      {/* ================= GENDER ================= */}
      <div className="space-y-3">

        <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
          Select Your Gender
        </label>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">

          {/* Male */}
          <button
            type="button"
            disabled={searching}
            onClick={() => setGender("male")}
            className={`flex h-[58px] items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              gender === "male"
                ? "bg-[#1455e8] text-white shadow-lg shadow-blue-500/25"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <Mars
              className={`h-5 w-5 ${
                gender === "male"
                  ? "text-white"
                  : "text-slate-400"
              }`}
            />

            Male
          </button>

          {/* Female */}
          <button
            type="button"
            disabled={searching}
            onClick={() => setGender("female")}
            className={`flex h-[58px] items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              gender === "female"
                ? "bg-[#FFA500] text-white shadow-lg shadow-blue-500/25"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <Venus
              className={`h-5 w-5 ${
                gender === "female"
                  ? "text-white"
                  : "text-slate-400"
              }`}
            />

            Female
          </button>

        </div>
      </div>

      {/* ================= TERMS ================= */}
      <div className="mt-6 border-t border-slate-100 pt-5">

        <label
          htmlFor="terms"
          className="flex cursor-pointer items-start gap-3"
        >
          {/* Custom Checkbox */}
          <div className="relative mt-0.5 shrink-0">

            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) =>
                setAgreedToTerms(e.target.checked)
              }
              disabled={searching}
              className="peer absolute h-5 w-5 cursor-pointer opacity-0"
            />

            <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition peer-checked:border-blue-600 peer-checked:bg-blue-600">
              <Check
                className={`h-3.5 w-3.5 text-white transition ${
                  agreedToTerms
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0"
                }`}
              />
            </div>

          </div>

          <span className="text-xs font-medium leading-[1.55] text-slate-600">

            I confirm I have read and agree to the{" "}

            <a
              href="/community-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Community Guidelines
            </a>

            {" "}and{" "}

            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>

            . I certify I am at least 18 years old and I have
            reached the age of majority in my location.

          </span>
        </label>
      </div>

      {/* ================= SEARCHING ================= */}
      {searching ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-blue-50/60 py-6">

          <style jsx>{`
            @keyframes bounce-x-slow {
              0%,
              100% {
                transform: translateX(-25%);
              }

              50% {
                transform: translateX(25%);
              }
            }

            .animate-bounce-slow {
              animation: bounce-x-slow 2.5s ease-in-out infinite;
            }
          `}</style>

          <div className="relative h-20 w-20">
            <Image
              src="/logo-chat-boat.png"
              alt="Searching"
              width={80}
              height={80}
              className="animate-bounce-slow object-contain"
            />
          </div>

          <p className="mt-3 text-sm font-bold text-blue-600">
            Finding your next friend...
          </p>

          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-ping rounded-full bg-blue-600" />
            <span className="h-2 w-2 animate-ping rounded-full bg-blue-500 [animation-delay:200ms]" />
            <span className="h-2 w-2 animate-ping rounded-full bg-blue-400 [animation-delay:400ms]" />
          </div>

          <button
            onClick={() => setSearching(false)}
            type="button"
            className="mt-5 rounded-xl border border-red-200 bg-white px-5 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 active:scale-95"
          >
            Cancel Search
          </button>

        </div>
      ) : (

        /* ================= VIDEO BUTTON ================= */
        <div className="mt-6">

          <button
            onClick={() => startChat("video")}
            type="button"
            disabled={!agreedToTerms}
            className="group flex h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-[#1455e8] text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >

            <Video className="h-6 w-6 fill-white transition-transform group-hover:scale-110" />

            <span>Start</span>

          </button>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-slate-400">🔒</span>
            Your privacy is our priority
          </div>

        </div>
      )}

    </div>
  );
}