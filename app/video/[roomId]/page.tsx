"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  ShieldCheck,
  Smile,
  Loader2,
  Reply,
  Trash2,
  Copy,
  Check,
  UserCheck,
  Sliders,
  Play,
  Star,
  Crown,
  Coins,
  Plus,
  Info,
  User,
  Shield,
  Zap,
  MapPin,
  MessageSquare,
  UserPlus,
  Eye,
  EyeOff,
  Menu,
  MessageCircle,
  X,
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

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function CombinedVideoChatPage({ params }: Props) {
  const { roomId: initialRoomId } = use(params);

  // Current Active Room State
  const [currentRoomId, setCurrentRoomId] = useState<string>(initialRoomId);

  // Video Calling States & Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("Initializing...");
  const [isConnected, setIsConnected] = useState(false);
  const [isFriendAdded, setIsFriendAdded] = useState(false);
  const [hideRemoteVideo, setHideRemoteVideo] = useState(false);

  // Mobile Drawer Chat State
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Chat States
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSearchingNext, setIsSearchingNext] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyPayload | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Init Peer Connection Helper
  const createPeerConnection = (stream: MediaStream | null) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.oniceconnectionstatechange = () => {
      setConnectionStatus(pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setIsConnected(true);
        setIsSearchingNext(false);
      } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        setIsConnected(false);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch((err) => {
          if (err.name !== "AbortError") console.error("Video play error:", err);
        });
        setIsConnected(true);
        setIsSearchingNext(false);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId: currentRoomId, candidate: event.candidate });
      }
    };

    return pc;
  };

  // Socket & WebRTC Setup
  useEffect(() => {
    if (!currentRoomId) return;

    let isMounted = true;

    async function handleVideoOffer(data: { offer: RTCSessionDescriptionInit }) {
      if (!peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        while (pendingCandidates.current.length) {
          const candidate = pendingCandidates.current.shift();
          if (candidate) await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("video-answer", { roomId: currentRoomId, answer });
      } catch (err) {
        console.error("Offer error:", err);
      }
    }

    async function handleVideoAnswer(data: { answer: RTCSessionDescriptionInit }) {
      if (!peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        while (pendingCandidates.current.length) {
          const candidate = pendingCandidates.current.shift();
          if (candidate) await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Answer error:", err);
      }
    }

    async function handleIceCandidate(data: { candidate: RTCIceCandidateInit }) {
      if (!peerConnectionRef.current) return;
      try {
        if (peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          pendingCandidates.current.push(data.candidate);
        }
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    }

    function handleConnect() {
      socket.emit("join-room", currentRoomId);
    }

    function handleIncomingMessage(data: Message) {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) return prev;
        return [...prev, data];
      });
    }

    function handleMatchFound(data: { roomId: string }) {
      setCurrentRoomId(data.roomId);
      setIsSearchingNext(false);
      setMessages([]);
      socket.emit("join-room", data.roomId);
    }

    if (!socket.connected) socket.connect();
    else handleConnect();

    socket.on("connect", handleConnect);
    socket.on("message", handleIncomingMessage);
    socket.on(SOCKET_EVENTS.MATCH_FOUND || "match-found", handleMatchFound);
    socket.on("video-offer", handleVideoOffer);
    socket.on("video-answer", handleVideoAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    const setupMediaAndConnect = async () => {
      try {
        let stream = localStream;
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { max: 30 } },
            audio: true,
          });

          if (!isMounted) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }

        const pc = createPeerConnection(stream);

        const roomUsers = currentRoomId.replace("room_", "").split("_");
        if (socket.id === roomUsers[0]) {
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await pc.setLocalDescription(offer);
          socket.emit("video-offer", { roomId: currentRoomId, offer });
        }
      } catch (err) {
        console.error("Media error:", err);
        setConnectionStatus("Permission Denied");
      }
    };

    setupMediaAndConnect();

    return () => {
      isMounted = false;
      socket.off("connect", handleConnect);
      socket.off("message", handleIncomingMessage);
      socket.off(SOCKET_EVENTS.MATCH_FOUND || "match-found", handleMatchFound);
      socket.off("video-offer", handleVideoOffer);
      socket.off("video-answer", handleVideoAnswer);
      socket.off("ice-candidate", handleIceCandidate);

      if (peerConnectionRef.current) peerConnectionRef.current.close();
      socket.emit("leave-room", currentRoomId);
    };
  }, [currentRoomId]);

  // Direct In-Page Next Partner Function
  const handleNextStranger = () => {
    setIsSearchingNext(true);
    setIsConnected(false);
    setConnectionStatus("Searching...");

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    pendingCandidates.current = [];
    socket.emit("leave-room", currentRoomId);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    socket.emit(SOCKET_EVENTS.START_CHAT || "start-chat", {
      token,
      chatType: "video",
      gender: "any",
      isGuest: false,
    });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    const newMessage: Message & { roomId: string } = {
      id: crypto.randomUUID(),
      roomId: currentRoomId,
      sender: socket.id || "Self",
      message: trimmed,
      createdAt: Date.now(),
      replyTo: replyingTo ? { ...replyingTo } : null,
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send-message", newMessage);

    setInputMessage("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    socket.emit("delete-message", { roomId: currentRoomId, messageId });
  };

  const handleCopyMessage = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(messageId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex min-h-[100dvh] lg:h-screen w-full flex-col bg-[#F4F6FA] text-slate-800 font-sans">
      {/* Header */}
      <header className="flex h-14 lg:h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-3 lg:px-6 shadow-xs shrink-0">
        <div className="flex items-center gap-1.5 lg:gap-2">
          <Link href="/" className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]">
            <Image
              src="/logo-header.png"
              alt="vchatz logo"
              width={260}
              height={85}
              priority
              className="h-9 lg:h-16 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:gap-4">
          <button className="flex items-center gap-1 lg:gap-1.5 rounded-md lg:rounded-full bg-amber-500 lg:bg-blue-50/50 border-none lg:border lg:border-blue-200 px-2 lg:px-4 py-1 lg:py-1.5 text-[10px] lg:text-xs font-bold lg:font-semibold text-white lg:text-blue-600 hover:bg-amber-600 lg:hover:bg-blue-100">
            <Crown className="h-3 w-3 fill-white lg:hidden" />
            <Star className="hidden lg:block h-3.5 w-3.5 fill-blue-600" />
            <span className="lg:hidden">PLUS</span>
            <span className="hidden lg:inline">Free</span>
          </button>

          <button className="flex items-center gap-1 lg:gap-1.5 rounded-md lg:rounded-full bg-orange-500 lg:bg-purple-100 px-2 lg:px-4 py-1 lg:py-1.5 text-[10px] lg:text-xs font-bold lg:font-semibold text-white lg:text-purple-700 hover:bg-orange-600 lg:hover:bg-purple-200">
            <Star className="h-3 w-3 fill-white lg:hidden" />
            <Crown className="hidden lg:block h-3.5 w-3.5 fill-purple-700" />
            <span className="lg:hidden">FREE</span>
            <span className="hidden lg:inline">Plus</span>
          </button>

          <div className="flex items-center gap-1 lg:gap-2 rounded-full border border-amber-200 bg-amber-50 px-2 lg:px-3 py-0.5 lg:py-1.5 text-xs font-bold text-amber-700">
            <Coins className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-amber-500 text-amber-500 shrink-0" />
            <span className="hidden lg:inline">Coins</span>
            <span className="font-extrabold text-slate-800 text-[11px] lg:text-xs">120</span>
            <button className="flex h-3.5 w-3.5 lg:h-4 lg:w-4 items-center justify-center rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300">
              <Plus className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-l pl-2 lg:pl-4 border-gray-200">
            <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold leading-tight">Profile</p>
              <p className="text-[10px] text-gray-400">ID: VCH12345</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 lg:p-4 gap-1 lg:gap-2">
        {/* Left Section */}
        <div className="flex flex-1 flex-col gap-3 lg:gap-4">
          
          {/* Video Grid: Desktop = Side-by-Side (2 Cols), Mobile = Stacked (Vertical 2 Rows) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 flex-1">
            {/* Local Video */}
            <div className="relative flex h-[220px] sm:h-[280px] lg:h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-black shadow-xs">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover block"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md lg:hidden">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> You
              </div>
              <button className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
                <Info className="h-4 w-4" />
              </button>
            </div>

            {/* Remote Video Stream */}
            <div className="relative flex h-[220px] sm:h-[280px] lg:h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-black shadow-xs">
              {(!isConnected || isSearchingNext) && (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm font-semibold text-white">Finding your next partner...</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{connectionStatus}</p>
                </div>
              )}

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover ${!isConnected || isSearchingNext || hideRemoteVideo ? "hidden" : "block"}`}
              />

              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md lg:hidden">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Partner
              </div>

              {isConnected && !isSearchingNext && (
                <button
                  onClick={() => setIsFriendAdded(!isFriendAdded)}
                  className={`hidden lg:flex absolute top-3 left-3 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md transition ${
                    isFriendAdded ? "bg-emerald-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                >
                  {isFriendAdded ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Added
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" /> Add Friend
                    </>
                  )}
                </button>
              )}

              <button className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
                <Info className="h-4 w-4" />
              </button>

              {/* Eye Icon Control */}
              <div className="absolute bottom-3 right-3 lg:bottom-4 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 flex gap-3 rounded-full bg-black/40 p-1 lg:p-1.5 backdrop-blur-md">
                <button
                  onClick={() => setHideRemoteVideo((prev) => !prev)}
                  title={hideRemoteVideo ? "Show Video" : "Hide Video"}
                  className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
                >
                  {hideRemoteVideo ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Control Buttons (Desktop = 3 Equal Cards, Mobile = Image Match 3 Column Row) */}
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            <button className="flex items-center justify-between rounded-xl bg-white p-2.5 lg:p-3.5 shadow-xs border border-gray-100 hover:border-gray-200">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UserCheck className="h-4 w-4 lg:h-5 lg:w-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs lg:text-sm font-bold text-blue-600 truncate">Both</p>
                  <p className="text-[10px] lg:text-xs text-gray-400 truncate">All Gender</p>
                </div>
              </div>
            </button>

            <button className="flex items-center justify-between rounded-xl bg-white p-2.5 lg:p-3.5 shadow-xs border border-gray-100 hover:border-gray-200">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Sliders className="h-4 w-4 lg:h-5 lg:w-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs lg:text-sm font-bold text-slate-800 truncate">Settings</p>
                  <p className="text-[10px] lg:text-xs text-gray-400 truncate">Location Filter</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleNextStranger}
              disabled={isSearchingNext}
              className="flex items-center justify-center gap-2 lg:gap-2.5 rounded-xl bg-blue-600 p-2.5 lg:p-3.5 text-white font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50 active:scale-[0.98]"
            >
              {isSearchingNext ? <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" /> : <Play className="h-4 w-4 lg:h-5 lg:w-5 fill-white" />}
              <div className="text-left min-w-0">
                <p className="text-xs lg:text-sm font-bold leading-tight truncate">{isSearchingNext ? "Matching..." : "Start"}</p>
                <p className="text-[9px] lg:text-xs text-blue-200 font-normal truncate">Find Random Partner</p>
              </div>
            </button>
          </div>

          {/* Desktop Features Banner vs Mobile 18+ Exclusive Banner */}
          <div className="hidden lg:flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-purple-50/70 p-4 shadow-xs border border-purple-100/80">
            <div className="flex items-center gap-3.5 min-w-max">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <Crown className="h-8 w-8 fill-white text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-purple-900 tracking-tight">vchatz Plus</h3>
                <p className="text-[11px] font-medium text-gray-500">
                  Unlock premium features and take your experience to the next level!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 mx-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100/60 text-emerald-600">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-semibold text-slate-700 mt-1 leading-tight">Ad-Free<br />Experience</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100/60 text-amber-500">
                  <Zap className="h-4 w-4 fill-amber-500" />
                </div>
                <p className="text-[10px] font-semibold text-slate-700 mt-1 leading-tight">Priority<br />Matching</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100/60 text-indigo-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-semibold text-slate-700 mt-1 leading-tight">Gender & Location<br />Filter</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100/60 text-orange-600">
                  <MessageSquare className="h-4 w-4 fill-orange-600" />
                </div>
                <p className="text-[10px] font-semibold text-slate-700 mt-1 leading-tight">Unlimited<br />Chat Time</p>
              </div>
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition shrink-0">
              <Crown className="h-4 w-4 fill-white" /> Upgrade to Plus
            </button>
          </div>

          {/* Mobile Exclusive 18+ Ad Banner */}
          <div className="lg:hidden relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-3 text-white flex items-center justify-between border border-purple-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-600 text-[10px] font-black border-2 border-white">
                18+
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400">Exclusive Content</p>
                <p className="text-sm font-black text-white">TRY NOW!</p>
              </div>
            </div>
            <button className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-pink-700 transition">
              JOIN NOW
            </button>
          </div>
        </div>

        {/* Right Section Chat Box (Desktop Side-bar, Mobile Drawer) */}
        <div className={`
          lg:relative lg:flex lg:w-64 xl:w-72 lg:h-auto lg:rounded-2xl lg:shadow-xs lg:border lg:border-gray-100 lg:bg-white lg:flex-col
          ${isMobileChatOpen ? 'fixed inset-x-0 bottom-0 z-50 h-[70vh] bg-white rounded-t-2xl shadow-2xl flex flex-col border-t border-gray-200' : 'hidden lg:flex'}
        `}>
          <div className="flex items-center justify-between border-b border-gray-100 p-3 lg:p-4">
            <h2 className="text-sm font-bold text-slate-800">Chat</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Online
              </div>
              <button onClick={() => setIsMobileChatOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mx-3 mt-3 flex gap-2 rounded-xl bg-blue-50/60 p-2.5 text-xs text-blue-900 border border-blue-100">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-[11px] font-medium leading-tight">Be kind and respectful. Inappropriate behavior will lead to a ban.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender === socket.id;

              return (
                <div key={msg.id} className={`group relative flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1">
                    {isMe && (
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}

                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-slate-800 rounded-bl-none"}`}>
                      {msg.message}
                    </div>

                    {!isMe && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setReplyingTo({ id: msg.id, sender: msg.sender, message: msg.message })} className="p-1 text-slate-400 hover:text-slate-700">
                          <Reply className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleCopyMessage(msg.message, msg.id)} className="p-1 text-slate-400 hover:text-slate-700">
                          {copiedMsgId === msg.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-gray-100 flex items-center gap-1.5 flex-nowrap bg-white">
            <button type="button" onClick={() => setShowEmojiPicker((p) => !p)} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
              <Smile className="h-4 w-4" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="min-w-0 flex-1 rounded-full bg-gray-50 px-3 py-1.5 text-xs text-slate-800 border border-gray-200 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" disabled={!inputMessage.trim()} className="flex h-7 w-7 min-w-[28px] items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 shrink-0">
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div> 
      </div>

      {/* Floating Chat Icon for Mobile Screens */}
      <button 
        onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
        className="lg:hidden fixed bottom-12 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row h-auto lg:h-8 w-full items-center justify-between border-t border-gray-200 bg-white py-2 lg:py-0 px-4 lg:px-6 text-[10px] text-gray-400 gap-1.5 lg:gap-0 shrink-0">
        <p>© 2026 Vchatz. All rights reserved.</p>
        <div className="flex gap-3 lg:gap-4">
          <a href="#" className="hover:underline">Terms of Service</a>
          <span className="lg:hidden">|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span className="hidden lg:inline">|</span>
          <a href="#" className="hidden lg:inline hover:underline">Community Guidelines</a>
          <span className="lg:hidden">|</span>
          <a href="#" className="hover:underline">Contact Us</a>
        </div>
      </footer>

    </div>
  );
}