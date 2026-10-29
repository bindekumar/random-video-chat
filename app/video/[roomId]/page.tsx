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
  Eye,
  EyeOff,
  MessageCircle,
  X,
  Square,
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

  const [currentRoomId, setCurrentRoomId] = useState<string>(initialRoomId);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("Initializing...");
  const [isConnected, setIsConnected] = useState(false);
  const [isFriendAdded, setIsFriendAdded] = useState(false);
  const [hideRemoteVideo, setHideRemoteVideo] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      } else if (
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "closed"
      ) {
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

  useEffect(() => {
    if (!currentRoomId) return;

    let isMounted = true;

    async function handleVideoOffer(data: { offer: RTCSessionDescriptionInit }) {
      if (!peerConnectionRef.current) return;
      try {
        if (peerConnectionRef.current.signalingState !== "stable") {
          return;
        }

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
        if (peerConnectionRef.current.signalingState === "stable") {
          return;
        }

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
      setIsConnected(false);
      pendingCandidates.current = [];
      socket.emit("join-room", data.roomId);
      
      if (localStream) {
        const pc = createPeerConnection(localStream);
        const roomUsers = data.roomId.replace("room_", "").split("_");
        if (socket.id === roomUsers[0]) {
          pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true }).then((offer) => {
            pc.setLocalDescription(offer);
            socket.emit("video-offer", { roomId: data.roomId, offer });
          });
        }
      }
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
      peerConnectionRef.current = null;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    socket.emit(SOCKET_EVENTS.START_CHAT || "start-chat", {
      token,
      chatType: "video",
      gender: "any",
      isGuest: false,
    });
  };

  const handleStopCall = () => {
    socket.emit("leave-room", currentRoomId);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    router.push("/");
  };

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
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
    <div className="flex h-[100dvh] w-full flex-col bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden select-none">
      {/* Header */}
      <header className="flex h-12 lg:h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-3 lg:px-6 shadow-xs shrink-0 z-50">
        <div className="flex items-center gap-1.5 lg:gap-2">
          <Link href="/" className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]">
            <Image
              src="/logo-header.png"
              alt="VChatz"
              width={160}
              height={55}
              priority
              className="h-auto w-[110px] sm:w-[130px] lg:w-[150px]"
            />
          </Link>
        </div>

        {/* DESKTOP OPTIONS */}
        <div className="hidden lg:flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-[#1455e8] px-3.5 py-1 text-xs font-bold text-white shadow-sm hover:scale-105 transition-all">
            <Star className="h-3 w-3 fill-white text-white" />
            <span>Free</span>
          </button>

          <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 px-3.5 py-1 text-xs font-bold text-white shadow-sm hover:scale-105 transition-all">
            <Crown className="h-3 w-3 fill-white text-white" />
            <span>Plus</span>
          </button>

          <div className="flex items-center gap-2 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
            <Coins className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
            <span>Coins</span>
            <span className="font-extrabold text-slate-900 text-xs bg-amber-200/70 px-1.5 py-0.5 rounded-full">120</span>
            <button className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xs hover:scale-110 transition">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1455e8] to-purple-600 text-white shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight text-slate-900">Profile</p>
              <p className="text-[9px] text-[#1455e8] font-semibold">ID: VCH12345</p>
            </div>
          </div>
        </div>

        {/* MOBILE PROFILE TOGGLE BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle Profile Menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-orange-50 text-[#1455e8] shadow-xs hover:shadow transition-all active:scale-95 lg:hidden"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </button>
      </header>

      {/* MOBILE MENU DRAWER */}
      <div
        id="mobile-menu"
        className={`absolute top-12 left-0 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-4 shadow-2xl transition-all duration-300 ease-in-out lg:hidden z-40 ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto block"
            : "-translate-y-4 opacity-0 pointer-events-none hidden"
        }`}
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1455e8] to-purple-600 text-white shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">My Profile</p>
              <p className="text-[10px] text-[#1455e8] font-semibold">ID: VCH12345</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 text-xs font-bold text-amber-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
              <span>Coins: <strong className="text-slate-900 bg-amber-200/70 px-1.5 py-0.5 rounded-full ml-1">120</strong></span>
            </div>
            <button className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm hover:scale-105 transition">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-[#1455e8] py-2 text-xs font-bold text-white shadow-sm">
              <Star className="h-3 w-3 fill-white" />
              <span>Free Plan</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 py-2 text-xs font-bold text-white shadow-sm">
              <Crown className="h-3 w-3 fill-white" />
              <span>Plus Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container - Strictly 1 Screen Fixed */}
      <div className="flex flex-1 overflow-hidden p-2 lg:p-3 gap-2 relative">
        {/* Left Section (Video and Controls Area) */}
        <div className="flex flex-1 flex-col gap-2 overflow-hidden justify-between">
          {/* Video Grid */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 transition-all duration-300 flex-1 min-h-0`}>
            {/* Local Video */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-md border border-slate-800">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover block"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> You
              </div>

              {/* Mute Button inside Local Video */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-slate-950/80 p-1 backdrop-blur-xl border border-white/15 shadow-lg">
                <button
                  onClick={handleToggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    isMuted
                      ? "bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{isMuted ? "Muted" : "Mute"}</span>
                </button>
              </div>
            </div>

            {/* Remote Video Stream */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-md border border-slate-800">
              {(!isConnected || isSearchingNext) && (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1455e8] mb-2" />
                  <p className="text-xs font-semibold text-white">Finding your next partner...</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{connectionStatus}</p>
                </div>
              )}

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover ${!isConnected || isSearchingNext || hideRemoteVideo ? "hidden" : "block"}`}
              />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Partner
              </div>

              {isConnected && !isSearchingNext && (
                <button
                  onClick={() => setIsFriendAdded(!isFriendAdded)}
                  className={`hidden lg:flex absolute top-2.5 left-24 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur-md transition shadow-sm ${
                    isFriendAdded
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      : "bg-slate-900/70 border border-white/15 text-white hover:bg-slate-900/90"
                  }`}
                >
                  {isFriendAdded ? (
                    <>
                      <Check className="h-3 w-3" /> Added
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3" /> Add Friend
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Control Buttons (Both, Settings, Stop, Eye Icon + Start/Next Button) */}
          <div className="grid grid-cols-4 gap-1.5 lg:gap-2 shrink-0">
            {/* Gender Filter Button */}
            <button className="flex items-center justify-between rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 p-2 lg:p-2.5 text-white shadow-sm hover:scale-[1.01] transition-all border border-teal-400/30">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] lg:text-xs font-bold truncate">Both</p>
                  <p className="text-[8px] text-teal-100 truncate">All Gender</p>
                </div>
              </div>
            </button>

            {/* Settings Filter Button */}
            <button className="flex items-center justify-between rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-2 lg:p-2.5 text-white shadow-sm hover:scale-[1.01] transition-all border border-purple-400/30">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                  <Sliders className="h-3.5 w-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] lg:text-xs font-bold truncate">Settings</p>
                  <p className="text-[8px] text-purple-100 truncate">Filter</p>
                </div>
              </div>
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStopCall}
              title="Stop Call"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#eab308] hover:bg-yellow-600 p-2 lg:p-2.5 text-white font-bold shadow-sm transition-all"
            >
              <Square className="h-3.5 w-3.5 fill-white" />
              <span className="text-[11px] lg:text-xs font-bold truncate">Stop</span>
            </button>

            {/* Start / Next Button with Eye Icon on its left side */}
            <div className="flex items-center gap-1 bg-[#1455e8] rounded-xl p-1 shadow-md border border-blue-400/30">
              <button
                onClick={() => setHideRemoteVideo((prev) => !prev)}
                title={hideRemoteVideo ? "Show Video" : "Hide Video"}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                  hideRemoteVideo
                    ? "bg-amber-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {hideRemoteVideo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>

              <button
                onClick={handleNextStranger}
                disabled={isSearchingNext}
                className="flex flex-1 items-center justify-center gap-1 bg-transparent text-white font-bold p-1 disabled:opacity-50"
              >
                {isSearchingNext ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-white text-white" />
                )}
                <div className="text-left min-w-0 pr-1">
                  <p className="text-[10px] lg:text-xs font-bold leading-tight truncate">
                    {isSearchingNext ? "Finding..." : isConnected ? "Next" : "Start"}
                  </p>
                  <p className="text-[8px] text-blue-100 truncate">
                    {isSearchingNext ? "Please wait" : isConnected ? "Find another partner" : "Find Partner"}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Designed Banner */}
          <div className="relative w-full h-[50px] sm:h-[58px] lg:h-[65px] overflow-hidden rounded-xl shadow-sm shrink-0 bg-[#090314] flex items-center justify-between px-3">
            <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
              <Image
                src="/logo-chat-boat.png"
                alt="Banner Background"
                fill
                className="object-cover object-right"
                priority
              />
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-pink-600 text-white font-black text-xs rounded-md shadow-md">
                18+
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[8px] font-extrabold tracking-widest text-pink-300 uppercase">
                  EXCLUSIVE CONTENT
                </span>
                <span className="text-xs font-black text-pink-500 tracking-wide leading-tight">
                  TRY NOW!
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <button className="rounded-lg bg-pink-600 px-3 py-1 text-[10px] font-bold text-white shadow-md hover:bg-pink-700 transition">
                JOIN NOW
              </button>
            </div>
          </div>
        </div>

        {/* Right Section Chat Box */}
        <div className={`
          bg-white shadow-2xl transition-all duration-300 z-30 flex flex-col
          lg:relative lg:w-72 lg:rounded-xl lg:border lg:border-slate-200/80
          ${isChatVisible
            ? 'flex fixed inset-x-0 bottom-0 h-[45vh] rounded-t-2xl border-t border-slate-200 lg:h-auto'
            : 'hidden'}
        `}>
          <div className="flex items-center justify-between border-b border-slate-100 p-2.5 shrink-0">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-[#1455e8]" /> Chat
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </div>
              <button
                onClick={() => setIsChatVisible(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mx-2 mt-1.5 flex gap-1.5 rounded-lg bg-blue-50/70 p-1.5 text-[10px] text-blue-900 border border-blue-100 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#1455e8]" />
            <p className="font-medium leading-tight">Be kind. Inappropriate behavior leads to a ban.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0">
            {messages.map((msg) => {
              const isMe = msg.sender === socket.id;

              return (
                <div key={msg.id} className={`group relative flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1">
                    {isMe && (
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-0.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}

                    <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs font-medium shadow-xs ${isMe ? "bg-[#1455e8] text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"}`}>
                      {msg.message}
                    </div>

                    {!isMe && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setReplyingTo({ id: msg.id, sender: msg.sender, message: msg.message })} className="p-0.5 text-slate-400 hover:text-slate-700">
                          <Reply className="h-2.5 w-2.5" />
                        </button>
                        <button onClick={() => handleCopyMessage(msg.message, msg.id)} className="p-0.5 text-slate-400 hover:text-slate-700">
                          {copiedMsgId === msg.id ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-0.5 px-1 font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 flex items-center gap-1.5 flex-nowrap bg-white shrink-0">
            <button type="button" onClick={() => setShowEmojiPicker((p) => !p)} className="text-slate-400 hover:text-[#1455e8] p-1 shrink-0 transition">
              <Smile className="h-3.5 w-3.5" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="min-w-0 flex-1 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-[#1455e8] transition"
            />
            <button type="submit" disabled={!inputMessage.trim()} className="flex h-6 w-6 min-w-[24px] items-center justify-center rounded-full bg-[#1455e8] text-white disabled:opacity-40 shrink-0 transition">
              <Send className="h-2.5 w-2.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsChatVisible(!isChatVisible)}
        className="fixed bottom-10 right-3 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#1455e8] text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Footer */}
      <footer className="flex h-6 w-full items-center justify-between border-t border-slate-200 bg-white px-3 text-[9px] text-slate-400 shrink-0 z-20">
        <p>© 2026 Vchatz. All rights reserved.</p>
        <div className="flex gap-3">
          <a href="#" className="hover:underline">Terms</a>
          <span>|</span>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
      </footer>
    </div>
  );
}