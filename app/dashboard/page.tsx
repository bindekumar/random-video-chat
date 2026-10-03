"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
  XCircle,
  Zap,
  Crown,
  CheckCircle2,
  Users,
  KeyRound,
  UserCog,
  BadgeCheck,
} from "lucide-react";

import { socket } from "@/lib/socket";
import { SOCKET_EVENTS } from "@/servers/socket/events";

interface User {
  _id: string;
  username: string;
  email: string;
  isPremium?: boolean;
  planType?: "free" | "pro" | "vip"; // Plan type track karne ke liye
  planExpiresAt?: string; // Expiry date dikhane ke liye
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Track active online users count
  const [activeUsersCount, setActiveUsersCount] = useState<number>(1012);

  // Track searching mode ("text" | "video" | null)
  const [searchingMode, setSearchingMode] = useState<"text" | "video" | null>(
    null
  );

  /* 1. Fetch Logged-in User */
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  /* 2. Socket Setup & Matchmaking Events */
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Socket Connected:", socket.id);
      socket.emit("user-online", {
        userId: user._id,
        username: user.username,
      });
    };

    const handleWaiting = () => {
      console.log("⏳ Waiting for a stranger...");
    };

    const handleMatchFound = (data: {
      roomId: string;
      partner: { username: string };
    }) => {
      console.log("Match Found:", data);
      setSearchingMode(null);
      router.push(`/chat/${data.roomId}`);
    };

    const handleActiveUsersCount = (data: { count: number } | number) => {
      const count = typeof data === "number" ? data : data?.count || 0;
      setActiveUsersCount(count);
    };

    socket.on("connect", handleConnect);
    socket.on(SOCKET_EVENTS.WAITING, handleWaiting);
    socket.on(SOCKET_EVENTS.MATCH_FOUND, handleMatchFound);
    socket.on("active-users-count", handleActiveUsersCount);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off(SOCKET_EVENTS.WAITING, handleWaiting);
      socket.off(SOCKET_EVENTS.MATCH_FOUND, handleMatchFound);
      socket.off("active-users-count", handleActiveUsersCount);
    };
  }, [user, router]);

  /* 3. Start & Cancel Searching Functions */
  const handleStartChat = (mode: "text" | "video") => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    setSearchingMode(mode);

    socket.emit(SOCKET_EVENTS.START_CHAT, {
      token: localStorage.getItem("token"),
      userId: user._id,
      username: user.username,
      chatType: mode,
      gender: "any",
      isGuest: false,
    });

    console.log(`Searching for stranger (${mode} mode)...`);
  };

  const handleCancelSearch = () => {
    setSearchingMode(null);
    if (user) {
      socket.emit("cancel-search", { userId: user._id });
    }
  };

  /* 4. Logout Handler */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      socket.disconnect();
      localStorage.removeItem("token");
      router.replace("/login");
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 font-sans text-white antialiased selection:bg-indigo-500 selection:text-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />

        <div className="relative z-10 flex flex-col items-center rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl max-w-xs w-full text-center">
          <div className="relative flex items-center justify-center h-20 w-20 mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20 duration-1000" />
            <div className="absolute h-16 w-16 animate-pulse rounded-full border border-indigo-500/40 bg-indigo-500/10" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-6 w-6 animate-spin duration-3000 text-indigo-100" />
            </div>
          </div>

          <h3 className="text-base font-semibold tracking-tight text-white">
            Setting up your workspace
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Loading your profile & preferences...
          </p>

          <div className="mt-6 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
              <div className="h-full w-1/2 animate-[shimmer_1.5s_infinite] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%]" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-zinc-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Connecting securely ...
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-blue-500 selection:text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

      <div>
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white">
                  V<span className="text-blue-500">Chatz</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden text-left sm:block">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-200">
                    {user?.username}
                  </p>
                  
                  {/* HEADER PLAN BADGE */}
                  {user?.isPremium ? (
                    <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                      <Crown className="h-3 w-3" />
                      {user?.planType || "PRO"}
                    </span>
                  ) : (
                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase text-zinc-400">
                      Free Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{user?.email}</p>
              </div>

              <div className="h-8 w-[1px] bg-zinc-800 hidden sm:block" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                ) : (
                  <LogOut className="h-3.5 w-3.5 text-zinc-400" />
                )}
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
          {/* Banner Section */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/40 to-zinc-950/90 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/0 blur-2xl" />

            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Instant Video & Chat Matchmaking</span>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    {user?.username}
                  </span>
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Ready to make new connections today? Jump straight into live
                  chat conversations.
                </p>
              </div>

              {/* Active Users Display Badge */}
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-3 py-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{activeUsersCount} Online</span>
                  </div>
                </div>

                <div className="h-4 w-[1px] bg-zinc-800" />

                <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-zinc-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Encrypted Connection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* 1. Text Chat Card */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-emerald-500/5">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-zinc-950">
                  <MessageSquare className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  Text Chat
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Connect instantly with random people worldwide in secure, real-time private text rooms.
                </p>
              </div>

              <div className="mt-8">
                {searchingMode !== "text" ? (
                  <button
                    onClick={() => handleStartChat("text")}
                    disabled={searchingMode !== null}
                    className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    <span>Start Text</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 text-xs font-medium text-emerald-400 backdrop-blur-md"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </button>
                    <button
                      onClick={handleCancelSearch}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      title="Cancel Search"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Video Chat Card */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-blue-500/5">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-zinc-950">
                  <Video className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  Video Chat
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Face-to-face live video calling with strangers across the globe with full privacy.
                </p>
              </div>

              <div className="mt-8">
                {searchingMode !== "video" ? (
                  <button
                    onClick={() => handleStartChat("video")}
                    disabled={searchingMode !== null}
                    className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50"
                  >
                    <Video className="h-4 w-4" />
                    <span>Start Video</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3.5 text-xs font-medium text-blue-400 backdrop-blur-md"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </button>
                    <button
                      onClick={handleCancelSearch}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      title="Cancel Search"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Dynamic Premium Status Card */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-900/40 to-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl" />

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-zinc-950">
                    <Crown className="h-6 w-6" />
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    user?.isPremium 
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }`}>
                    {user?.isPremium ? "ACTIVE PLAN" : "FREE USER"}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {user?.isPremium ? `${user?.planType?.toUpperCase() || "PRO"} Plan` : "Premium Pass"}
                </h3>

                {/* Dynamic Features List / Plan Info */}
                {user?.isPremium ? (
                  <div className="mt-3 space-y-2 text-xs text-zinc-300">
                    <p className="flex items-center gap-2 font-medium text-emerald-400">
                      <BadgeCheck className="h-4 w-4 shrink-0" />
                      <span>All Pro features unlocked</span>
                    </p>
                    {user?.planExpiresAt && (
                      <p className="text-[11px] text-zinc-400">
                        Renews/Expires: <span className="text-zinc-200">{user.planExpiresAt}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Gender & Location Filters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Ad-free Experience</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Priority Queue Matching</span>
                    </li>
                  </ul>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => router.push("/premium")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] shadow-lg shadow-amber-500/20"
                >
                  <Crown className="h-4 w-4" />
                  <span>{user?.isPremium ? "Manage Subscription" : "Upgrade Now"}</span>
                </button>
              </div>
            </div>

            {/* 4. Profile Card */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-purple-500/5">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-zinc-950">
                  <UserIcon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">Your Profile</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Manage personal details, account settings, and security preferences.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-2.5">
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs font-semibold text-zinc-200 transition-all hover:border-purple-500/40 hover:bg-zinc-800 hover:text-white active:scale-[0.99]"
                >
                  <UserCog className="h-3.5 w-3.5 text-purple-400" />
                  Update Profile
                </button>

                <button
                  onClick={() => router.push("/forgot-password")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 px-4 py-2.5 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 active:scale-[0.99]"
                >
                  <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                  Forgot / Reset Password
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-zinc-950/80 py-6 backdrop-blur-lg mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>© {new Date().getFullYear()} MeetStream. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
            <a href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            <a href="/safety" className="transition-colors hover:text-white">
              Safety Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}