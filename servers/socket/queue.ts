export type WaitingUser = {
  userId: string;
  username: string;
  socketId: string;
  isGuest: boolean;
  gender: string;
};

const waitingQueue: WaitingUser[] = [];

/**
 * Add user to waiting queue
 */
export const addToQueue = (
  user: WaitingUser
): void => {
  const exists = waitingQueue.some(
    (u) => u.socketId === user.socketId
  );

  if (!exists) {
    waitingQueue.push(user);
  }

  console.log(
    `📥 Queue: ${waitingQueue.length} user(s)`
  );
};

/**
 * Remove user from queue
 */
export const removeFromQueue = (
  socketId: string
): WaitingUser | null => {
  const index = waitingQueue.findIndex(
    (user) => user.socketId === socketId
  );

  if (index === -1) {
    return null;
  }

  const removed = waitingQueue.splice(index, 1)[0];

  console.log(
    `📤 Queue: ${waitingQueue.length} user(s)`
  );

  return removed;
};

/**
 * Get first waiting user
 *
 * NOTE:
 * This removes the user from the queue.
 */
export const getWaitingUser = (): WaitingUser | undefined => {
  return waitingQueue.shift();
};

/**
 * Queue Count
 */
export const getQueueCount = (): number => {
  return waitingQueue.length;
};

/**
 * Get all waiting users (Debug)
 */
export const getQueue = (): WaitingUser[] => {
  return [...waitingQueue];
};

/**
 * Clear queue
 */
export const clearQueue = (): void => {
  waitingQueue.length = 0;
};