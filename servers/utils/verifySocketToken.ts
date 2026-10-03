import jwt from "jsonwebtoken";

export interface SocketUser {
  id: string;
  username: string;
}

export function verifySocketToken(
  token?: string | null
): SocketUser | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as SocketUser;

    return decoded;
  } catch {
    return null;
  }
}