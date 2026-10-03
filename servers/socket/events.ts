export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // User
  USER_ONLINE: "user-online",
  ONLINE_USERS: "online-users",

  // Queue / Matching
  START_CHAT: "start-chat",
  WAITING: "waiting",
  MATCH_FOUND: "match-found",
  NEXT_PARTNER: "next-partner",
  LEAVE_QUEUE: "leave-queue",

  // Room
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",

  // Chat
  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",

  // WebRTC
  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "ice-candidate",

  // Media
  TOGGLE_MIC: "toggle-mic",
  TOGGLE_CAMERA: "toggle-camera",
} as const;

export type SocketEvent =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];