"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Video,
  VideoOff,
  MessageCircle,
  X,
  PhoneOff,
  Mic,
  MicOff,
  UserPlus,
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
  const router = useRouter();
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

  // Mute & Chat Toggle States
  const [isMuted, setIsMuted] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", currentRoomId);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    router.push("/");
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
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#F8FAFC] text-slate-800 font-sans overflow-x-hidden">
      {/* Premium Header */}
      <header className="flex h-14 lg:h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-3 lg:px-6 shadow-sm shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-1.5 lg:gap-2">
          <Link href="/" className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]">
            <Image
              src="/logo-header.png"
              alt="VChatz"
              width={185}
              height={65}
              priority
              className="h-auto w-[130px] sm:w-[155px] lg:w-[180px]"
            />
          </Link>
        </div>

        {/* DESKTOP OPTIONS - Gradient Modern Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:scale-105 transition-all">
            <Star className="h-3.5 w-3.5 fill-white text-white" />
            <span>Free</span>
          </button>

          <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:scale-105 transition-all">
            <Crown className="h-3.5 w-3.5 fill-white text-white" />
            <span>Plus</span>
          </button>

          <div className="flex items-center gap-2 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
            <Coins className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
            <span>Coins</span>
            <span className="font-extrabold text-slate-900 text-xs bg-amber-200/70 px-1.5 py-0.5 rounded-full">120</span>
            <button className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xs hover:scale-110 transition">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight text-slate-900">Profile</p>
              <p className="text-[10px] text-indigo-500 font-semibold">ID: VCH12345</p>
            </div>
          </div>
        </div>

        {/* MOBILE PROFILE TOGGLE BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle Profile Menu"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 shadow-xs hover:shadow transition-all active:scale-95 lg:hidden"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* MOBILE MENU DRAWER (OPENS ON PROFILE CLICK) */}
      <div
        id="mobile-menu"
        className={`absolute top-14 left-0 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-5 py-5 shadow-2xl transition-all duration-300 ease-in-out lg:hidden z-40 ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto block"
            : "-translate-y-4 opacity-0 pointer-events-none hidden"
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">My Profile</p>
              <p className="text-xs text-indigo-500 font-semibold">ID: VCH12345</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 text-xs font-bold text-amber-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
              <span>Coins Balance: <strong className="text-slate-900 bg-amber-200/70 px-2 py-0.5 rounded-full ml-1">120</strong></span>
            </div>
            <button className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:scale-105 transition">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 active:scale-95 transition">
              <Star className="h-3.5 w-3.5 fill-white" />
              <span>Free Plan</span>
            </button>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 active:scale-95 transition">
              <Crown className="h-3.5 w-3.5 fill-white" />
              <span>Plus Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-y-auto p-2 lg:p-4 gap-2 relative">
        {/* Left Section (Video and Controls Area) */}
        <div className="flex flex-1 flex-col gap-2 lg:gap-3">

          {/* Video Grid */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 transition-all duration-300 ${isChatVisible ? 'h-[42vh] lg:h-[55vh]' : 'h-[64vh] lg:h-[72vh]'}`}>
            {/* Local Video */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 shadow-lg border border-slate-800">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover block"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> You
              </div>

              <button className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/60 border border-white/10 text-white backdrop-blur-md hover:bg-slate-900/80 transition">
                <Info className="h-4 w-4" />
              </button>

              {/* Redesigned Premium Glassmorphism Floating Mute & Leave Controls */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-slate-950/80 p-1.5 backdrop-blur-xl border border-white/15 shadow-2xl">
                <button
                  onClick={handleToggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    isMuted
                      ? "bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/30"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{isMuted ? "Muted" : "Mute"}</span>
                </button>

                <button
                  onClick={handleLeaveRoom}
                  title="Leave Call"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-rose-600/30"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Leave</span>
                </button>
              </div>
            </div>

            {/* Remote Video Stream */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 shadow-lg border border-slate-800">
              {(!isConnected || isSearchingNext) && (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-2" />
                  <p className="text-sm font-semibold text-white">Finding your next partner...</p>
                  <p className="text-xs text-slate-400 mt-1 capitalize">{connectionStatus}</p>
                </div>
              )}

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover ${!isConnected || isSearchingNext || hideRemoteVideo ? "hidden" : "block"}`}
              />

              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Partner
              </div>

              {isConnected && !isSearchingNext && (
                <button
                  onClick={() => setIsFriendAdded(!isFriendAdded)}
                  className={`hidden lg:flex absolute top-3 left-3 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold backdrop-blur-md transition shadow-md ${
                    isFriendAdded
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      : "bg-slate-900/70 border border-white/15 text-white hover:bg-slate-900/90"
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

              <button className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/60 border border-white/10 text-white backdrop-blur-md hover:bg-slate-900/80 transition">
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Control Buttons (Ultra-Premium Responsive Colors) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3 shrink-0">
            {/* Gender Filter Button - Teal Gradient */}
            <button className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-3 lg:p-3.5 text-white shadow-md shadow-teal-500/20 hover:scale-[1.02] hover:shadow-lg transition-all border border-teal-400/30">
              <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                <div className="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
                  <UserCheck className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs lg:text-sm font-extrabold truncate">Both</p>
                  <p className="text-[10px] lg:text-xs text-teal-100 font-medium truncate">All Gender</p>
                </div>
              </div>
            </button>

            {/* Settings Filter Button - Violet Gradient */}
            <button className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-3 lg:p-3.5 text-white shadow-md shadow-purple-600/20 hover:scale-[1.02] hover:shadow-lg transition-all border border-purple-400/30">
              <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                <div className="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
                  <Sliders className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs lg:text-sm font-extrabold truncate">Settings</p>
                  <p className="text-[10px] lg:text-xs text-indigo-100 font-medium truncate">Location Filter</p>
                </div>
              </div>
            </button>

            {/* Video Hide/Show Toggle - Amber/Orange Gradient */}
            <button
              onClick={() => setHideRemoteVideo((prev) => !prev)}
              className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 lg:p-3.5 text-white shadow-md shadow-amber-500/20 hover:scale-[1.02] hover:shadow-lg transition-all border border-amber-400/30"
            >
              <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                <div className="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
                  {hideRemoteVideo ? <VideoOff className="h-4.5 w-4.5 lg:h-5 lg:w-5" /> : <Video className="h-4.5 w-4.5 lg:h-5 lg:w-5" />}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs lg:text-sm font-extrabold truncate">
                    {hideRemoteVideo ? "Show Video" : "Hide Video"}
                  </p>
                  <p className="text-[10px] lg:text-xs text-amber-100 font-medium truncate">
                    {hideRemoteVideo ? "Video Hidden" : "Video Visible"}
                  </p>
                </div>
              </div>
            </button>

            {/* Start / Find Partner Button - Bright Blue/Indigo Gradient */}
            <button
              onClick={handleNextStranger}
              disabled={isSearchingNext}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 lg:p-3.5 text-white font-extrabold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 active:scale-[0.98] border border-indigo-400/30"
            >
              {isSearchingNext ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-white text-white" />}
              <div className="text-left min-w-0">
                <p className="text-xs lg:text-sm font-extrabold leading-tight truncate">{isSearchingNext ? "Matching..." : "Start"}</p>
                <p className="text-[9px] lg:text-xs text-indigo-100 font-medium truncate">Find Partner</p>
              </div>
            </button>
          </div>

          {/* Designed Banner */}
          <div className="relative w-full h-[70px] sm:h-[80px] lg:h-[90px] overflow-hidden rounded-2xl shadow-md shrink-0 bg-[#090314] flex items-center justify-between px-4">
            <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
              <Image
                src="/logo-chat-boat.png"
                alt="Banner Background"
                fill
                className="object-cover object-right"
                priority
              />
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center bg-pink-600 text-white font-black text-xs sm:text-sm rounded-lg shadow-lg">
                18+
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-pink-300 uppercase drop-shadow-xs">
                  EXCLUSIVE CONTENT
                </span>
                <span className="text-sm sm:text-lg font-black text-pink-500 tracking-wide drop-shadow-md leading-tight">
                  TRY NOW!
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <button className="rounded-xl bg-pink-600 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-600/40 hover:bg-pink-700 active:scale-95 transition">
                JOIN NOW
              </button>
            </div>
          </div>
        </div>

        {/* Right Section Chat Box */}
        <div className={`
          bg-white shadow-2xl transition-all duration-300 z-30 flex flex-col
          lg:relative lg:w-80 lg:rounded-2xl lg:border lg:border-slate-200/80
          ${isChatVisible
            ? 'flex fixed inset-x-0 bottom-0 h-[50vh] rounded-t-3xl border-t border-slate-200 lg:h-auto'
            : 'hidden'}
        `}>
          <div className="flex items-center justify-between border-b border-slate-100 p-3 shrink-0">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-indigo-600" /> Chat
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </div>
              <button
                onClick={() => setIsChatVisible(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mx-3 mt-2 flex gap-2 rounded-xl bg-indigo-50/70 p-2 text-xs text-indigo-900 border border-indigo-100 shrink-0">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600" />
            <p className="text-[10px] font-medium leading-tight">Be kind and respectful. Inappropriate behavior will lead to a ban.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
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

                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium shadow-xs ${isMe ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"}`}>
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
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 flex items-center gap-1.5 flex-nowrap bg-white shrink-0">
            <button type="button" onClick={() => setShowEmojiPicker((p) => !p)} className="text-slate-400 hover:text-indigo-600 p-1 shrink-0 transition">
              <Smile className="h-4 w-4" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="min-w-0 flex-1 rounded-full bg-slate-50 px-3.5 py-1.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
            <button type="submit" disabled={!inputMessage.trim()} className="flex h-7 w-7 min-w-[28px] items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-md disabled:opacity-40 shrink-0 transition">
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsChatVisible(!isChatVisible)}
        className="fixed bottom-12 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Footer */}
      <footer className="flex h-7 w-full items-center justify-between border-t border-slate-200 bg-white px-4 text-[10px] text-slate-400 shrink-0 z-20">
        <p>© 2026 Vchatz. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Terms of Service</a>
          <span className="hidden lg:inline">|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span className="hidden lg:inline">|</span>
          <a href="#" className="hover:underline">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}