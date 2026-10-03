type OnlineUser = {
  userId: string;
  username: string;
  socketId: string;
};

const onlineUsers = new Map<string, OnlineUser>();

export const addUser = (user: OnlineUser) => {
  onlineUsers.set(user.userId, user);
};

export const removeUser = (socketId: string) => {
  for (const [userId, user] of onlineUsers.entries()) {
    if (user.socketId === socketId) {
      onlineUsers.delete(userId);
      return user;
    }
  }

  return null;
};

export const getUser = (userId: string) => {
  return onlineUsers.get(userId);
};

export const getOnlineUsers = () => {
  return [...onlineUsers.values()];
};