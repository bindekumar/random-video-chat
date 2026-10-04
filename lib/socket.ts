import { io, Socket } from "socket.io-client";

// Production/Live par auto domain pickup + local fallback
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["polling", "websocket"], // Initial handshake fallback ke liye polling add karein
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});