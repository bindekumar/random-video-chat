import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,

  // Prefer WebSocket transport
  transports: ["websocket"],

  // Reconnect automatically
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  // Connection timeout
  timeout: 20000,
});