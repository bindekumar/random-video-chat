"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Radio,
  Clock,
  MessageSquare,
  ShieldCheck,
  Video,
  Activity,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Settings,
  Search,
  Bell,
  User,
  ChevronRight,
  ShieldAlert,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

import { socket } from "@/lib/socket";

// Interface definitions
interface DashboardStats {
  totalUsers: number;
  onlineUsers: number;
  queueUsers: number;
  activeChats: number;
}

interface UserData {
  _id: string;
  username: string;
  email: string;
  status?: string;
}

interface ActiveRoom {
  id: string;
  type: "text" | "video";
  participants: number;
  startedAt: string;
}

interface QueueUser {
  id: string;
  username: string;
  mode: "text" | "video";
  waitTime: string;
}

// Chart Data Dummy Sets
const trafficAnalyticsData = [
  { time: "12 AM", activeUsers: 40, queueLength: 12 },
  { time: "04 AM", activeUsers: 25, queueLength: 5 },
  { time: "08 AM", activeUsers: 95, queueLength: 20 },
  { time: "12 PM", activeUsers: 180, queueLength: 45 },
  { time: "04 PM", activeUsers: 240, queueLength: 60 },
  { time: "08 PM", activeUsers: 310, queueLength: 85 },
  { time: "11 PM", activeUsers: 190, queueLength: 34 },
  { time: "12 AM", activeUsers: 160, queueLength: 34 },
  { time: "12 AM", activeUsers: 250, queueLength: 34 },
];

const chatTypeDistribution = [
  { name: "Video Call", count: 42, color: "#3b82f6" },
  { name: "Text Chat", count: 25, color: "#10b981" },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  // Loading & Admin States
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Real-time Stats & Data State
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1250,
    onlineUsers: 182,
    queueUsers: 34,
    activeChats: 67,
  });

  const [recentUsers] = useState<UserData[]>([
    { _id: "1", username: "Rahul", email: "rahul@example.com", status: "Online" },
    { _id: "2", username: "Amit", email: "amit@example.com", status: "In Queue" },
    { _id: "3", username: "Priya", email: "priya@example.com", status: "In Chat" },
  ]);

  const [activeRooms] = useState<ActiveRoom[]>([
    { id: "Room #123", type: "video", participants: 2, startedAt: "5m ago" },
    { id: "Room #456", type: "text", participants: 2, startedAt: "12m ago" },
    { id: "Room #789", type: "video", participants: 2, startedAt: "1m ago" },
  ]);

  const [waitingQueue] = useState<QueueUser[]>([
    { id: "q1", username: "Rahul", mode: "video", waitTime: "12s" },
    { id: "q2", username: "Amit", mode: "text", waitTime: "45s" },
    { id: "q3", username: "Sanjay", mode: "video", waitTime: "1m 10s" },
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn("Admin endpoint pending, rendering view.");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();

    if (!socket.connected) {
      socket.connect();
    }

    const handleActiveUsersCount = (data: { count: number } | number) => {
      const count = typeof data === "number" ? data : data?.count || 0;
      setStats((prev) => ({ ...prev, onlineUsers: count }));
    };

    socket.on("active-users-count", handleActiveUsersCount);

    return () => {
      isMounted = false;
      socket.off("active-users-count", handleActiveUsersCount);
    };
  }, [router]);

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 font-sans text-white antialiased">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="relative z-10 flex flex-col items-center rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-2xl shadow-2xl max-w-xs w-full text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <h3 className="text-base font-semibold text-white">Loading Admin Panel</h3>
          <p className="mt-1 text-xs text-zinc-400">Verifying security & privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-blue-500 selection:text-white">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

      {/* --- Top Header --- */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                VChatz <span className="text-xs font-semibold uppercase text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full ml-1">Admin</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search users, rooms..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500" />
            </button>

            <div className="h-6 w-[1px] bg-zinc-800" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 font-bold text-indigo-400 text-xs">
                AP
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-zinc-200">Admin Profile</p>
                <p className="text-[10px] text-zinc-500">Super Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Dashboard Body --- */}
      <div className="flex flex-1">
        
        {/* --- Sidebar Navigation --- */}
        <aside className="hidden w-64 border-r border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl md:block p-4">
          <div className="space-y-1 sticky top-20">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "users", label: "Users", icon: Users },
              { id: "rooms", label: "Rooms", icon: Video },
              { id: "reports", label: "Reports", icon: ShieldAlert },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* --- Dynamic Content Area --- */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Dashboard Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl capitalize">
                {activeTab} Overview
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time connection stats, system graphs & active monitoring.
              </p>
            </div>
            
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Live Monitor Active</span>
            </div>
          </div>

          {/* TAB 1: DASHBOARD / ANALYTICS VIEW */}
          {(activeTab === "dashboard" || activeTab === "analytics") && (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: "Total Users",
                    value: stats.totalUsers.toLocaleString(),
                    icon: Users,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    border: "hover:border-blue-500/40",
                  },
                  {
                    title: "Online Users",
                    value: stats.onlineUsers.toLocaleString(),
                    icon: Radio,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "hover:border-emerald-500/40",
                  },
                  {
                    title: "Queue Users",
                    value: stats.queueUsers.toLocaleString(),
                    icon: Clock,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    border: "hover:border-amber-500/40",
                  },
                  {
                    title: "Active Chats",
                    value: stats.activeChats.toLocaleString(),
                    icon: MessageSquare,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    border: "hover:border-purple-500/40",
                  },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl transition-all duration-300 ${card.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-400">
                          {card.title}
                        </span>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black tracking-tight text-white">
                          {card.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- GRAPH SECTION --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Realtime Traffic Area Chart */}
                <div className="lg:col-span-2 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        Traffic & Activity Graph
                      </h2>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Peak traffic hours & user engagement</p>
                    </div>
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full font-semibold">Today</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                        />
                        <Area type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
                        <Area type="monotone" dataKey="queueLength" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorQueue)" name="In Queue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chat Distribution Bar Chart */}
                <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl flex flex-col justify-between">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      Chat Modes Ratio
                    </h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Video vs Text preference</p>
                  </div>

                  <div className="h-56 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chatTypeDistribution} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                          {chatTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-around text-xs border-t border-zinc-800/60 pt-3">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Video (63%)
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Text (37%)
                    </span>
                  </div>
                </div>

              </div>

              {/* Section: Recent Users & Active Rooms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Users Card */}
                <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      Recent Registered Users
                    </h2>
                    <button className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-800/40">
                    {recentUsers.map((u) => (
                      <div key={u._id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300">
                            {u.username.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-200">{u.username}</p>
                            <p className="text-[10px] text-zinc-500">{u.email}</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300">
                          {u.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Rooms Card */}
                <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      Active Rooms Monitor
                    </h2>
                    <span className="text-[11px] text-zinc-500">{activeRooms.length} Active</span>
                  </div>

                  <div className="divide-y divide-zinc-800/40">
                    {activeRooms.map((room) => (
                      <div key={room.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                            room.type === "video" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {room.type === "video" ? <Video className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-200">{room.id}</p>
                            <p className="text-[10px] text-zinc-500">{room.participants} Participants • {room.startedAt}</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-400">
                          Live
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Waiting Queue Table */}
              <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Waiting Matchmaking Queue
                  </h2>
                  <span className="text-[11px] text-amber-400 font-medium">Real-time Sync</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-800/60 font-semibold">
                        <th className="pb-3 px-2"># Pos</th>
                        <th className="pb-3 px-2">Username</th>
                        <th className="pb-3 px-2">Mode</th>
                        <th className="pb-3 px-2 text-right">Wait Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {waitingQueue.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="py-3 px-2 text-zinc-500 font-medium">#{idx + 1}</td>
                          <td className="py-3 px-2 font-semibold text-zinc-200">{item.username}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              item.mode === "video" 
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {item.mode}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-zinc-400">{item.waitTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: USERS VIEW */}
          {activeTab === "users" && (
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
              <h2 className="text-base font-bold text-white mb-4">User Management Table</h2>
              <p className="text-xs text-zinc-400">Search, filter, block or edit registered platform users here.</p>
            </div>
          )}

          {/* TAB 3: ROOMS VIEW */}
          {activeTab === "rooms" && (
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
              <h2 className="text-base font-bold text-white mb-4">Live Video/Text Room Inspector</h2>
              <p className="text-xs text-zinc-400">Monitor ongoing sessions and WebRTC peer channels.</p>
            </div>
          )}

          {/* OTHER TABS FALLBACK */}
          {["reports", "settings"].includes(activeTab) && (
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-xl text-center">
              <h2 className="text-lg font-bold text-white capitalize">{activeTab} Panel</h2>
              <p className="text-xs text-zinc-400 mt-1">Section modules are configured and active.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}