import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "./events";
import { verifySocketToken } from "../utils/verifySocketToken";

import {
  addUser,
  removeUser,
  getOnlineUsers,
} from "./users";

import {
  addToQueue,
  getWaitingUser,
  removeFromQueue,
} from "./queue";

export default function initializeSocket(io: Server) {
  io.on(
    SOCKET_EVENTS.CONNECTION,
    (socket: Socket) => {
      console.log(`✅ Connected: ${socket.id}`);

      /*
       * USER ONLINE
       */
      socket.on(
        "user-online",
        (user: {
          userId: string;
          username: string;
        }) => {
          addUser({
            userId: user.userId,
            username: user.username,
            socketId: socket.id,
          });

          console.log(`🟢 ${user.username} is online`);
          console.log(
            `👥 Online Users: ${getOnlineUsers().length}`
          );

          io.emit(
            "online-users",
            getOnlineUsers()
          );
        }
      );

      /*
       * FIND RANDOM STRANGER
       */
      socket.on(
        SOCKET_EVENTS.START_CHAT,
        (data: {
          token?: string;
          userId?: string;
          username: string;
          gender: string;
          isGuest: boolean;
        }) => {
          const authUser = verifySocketToken(data.token);

          const currentUser = {
            userId:
              authUser?.id ??
              data.userId ??
              socket.id,

            username:
              authUser?.username ??
              data.username,

            socketId: socket.id,

            isGuest: !authUser,

            gender: data.gender,
          };

          console.log(
            `🔍 Searching: ${currentUser.username}`
          );

          const waitingUser = getWaitingUser();

          if (!waitingUser) {
            addToQueue({
              userId: currentUser.userId,
              username: currentUser.username,
              socketId: currentUser.socketId,
              isGuest: currentUser.isGuest,
              gender: currentUser.gender,
            });

            socket.emit(SOCKET_EVENTS.WAITING);

            console.log(
              "⏳ User added to queue"
            );

            return;
          }

          const partnerSocket = io.sockets.sockets.get(waitingUser.socketId);

          if (!partnerSocket) {
            removeFromQueue(waitingUser.socketId);
            addToQueue({
              userId: currentUser.userId,
              username: currentUser.username,
              socketId: currentUser.socketId,
              isGuest: currentUser.isGuest,
              gender: currentUser.gender,
            });
            socket.emit(SOCKET_EVENTS.WAITING);
            return;
          }

          removeFromQueue(waitingUser.socketId);

          const roomId = `room_${waitingUser.socketId}_${socket.id}`;

          socket.join(roomId);
          partnerSocket.join(roomId);

          console.log("=================================");
          console.log("🎉 Match Found");
          console.log("Room:", roomId);
          console.log("User 1:", waitingUser.username);
          console.log("User 2:", currentUser.username);
          console.log("=================================");

          socket.emit("match-found", {
            roomId,
            partner: {
              userId: waitingUser.userId,
              username: waitingUser.username,
            },
          });

          partnerSocket.emit("match-found", {
            roomId,
            partner: {
              userId: currentUser.userId,
              username: currentUser.username,
            },
          });

          console.log("✅ match-found emitted successfully");
        }
      );

      /*
       * JOIN ROOM
       */
      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        console.log(`🚪 ${socket.id} joined ${roomId}`);
      });

      /*
       * SEND MESSAGE
       */
      socket.on(
        "send-message",
        (data: {
          roomId: string;
          message: string;
          sender: string;
        }) => {
          console.log(`💬 ${data.sender}: ${data.message}`);
          io.to(data.roomId).emit("message", data);
        }
      );

      /*
       * WEBRTC VIDEO CALL SIGNALING
       */
      socket.on(
        "video-offer",
        (data: { roomId: string; offer: RTCSessionDescriptionInit }) => {
          console.log("📹 VIDEO OFFER from:", socket.id);
          socket.to(data.roomId).emit("video-offer", {
            offer: data.offer,
            from: socket.id,
          });
        }
      );

      socket.on(
        "video-answer",
        (data: { roomId: string; answer: RTCSessionDescriptionInit }) => {
          console.log("📹 VIDEO ANSWER from:", socket.id);
          socket.to(data.roomId).emit("video-answer", {
            answer: data.answer,
            from: socket.id,
          });
        }
      );

      socket.on(
        "ice-candidate",
        (data: { roomId: string; candidate: RTCIceCandidateInit }) => {
          console.log("🧊 ICE CANDIDATE from:", socket.id);
          socket.to(data.roomId).emit("ice-candidate", {
            candidate: data.candidate,
            from: socket.id,
          });
        }
      );

      socket.on("video-call-ended", (data: { roomId: string }) => {
        console.log("📴 VIDEO CALL ENDED by:", socket.id);
        socket.to(data.roomId).emit("video-call-ended", {
          from: socket.id,
        });
      });

      /*
       * DISCONNECT
       */
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        const removedUser = removeUser(socket.id);
        removeFromQueue(socket.id);

        if (removedUser) {
          console.log(`❌ ${removedUser.username} disconnected`);
          console.log(`👥 Online Users: ${getOnlineUsers().length}`);
          io.emit("online-users", getOnlineUsers());
        }

        console.log(`Socket Disconnected: ${socket.id}`);
      });
    }
  );
}