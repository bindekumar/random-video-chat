// without login chat
export interface CurrentUser {
  userId: string | null;
  username: string;
  token: string | null;
  isGuest: boolean;
}

export function getCurrentUser(): CurrentUser {
  if (typeof window === "undefined") {
    return {
      userId: null,
      username: "Guest",
      token: null,
      isGuest: true,
    };
  }

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return {
      userId: null,
      username: "Guest",
      token: null,
      isGuest: true,
    };
  }

  try {
    const parsed = JSON.parse(user);

    return {
      userId: parsed._id,
      username: parsed.username,
      token,
      isGuest: false,
    };
  } catch {
    return {
      userId: null,
      username: "Guest",
      token: null,
      isGuest: true,
    };
  }
}