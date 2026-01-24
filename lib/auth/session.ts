import { generateSessionId, signSession } from "./crypto";

export interface SessionData {
  userId: string;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  expiresAt: Date;
}

class SessionStore {
  private sessions = new Map<string, SessionData>();

  createSession(userId: string, userAgent?: string, ip?: string): string {
    const sessionId = generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const sessionData: SessionData = {
      userId,
      userAgent,
      ip,
      createdAt: now,
      expiresAt,
    };

    this.sessions.set(sessionId, sessionData);
    return sessionId;
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  rotateSession(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    // Create new session with same data
    const newSessionId = this.createSession(
      session.userId,
      session.userAgent,
      session.ip,
    );
    this.destroySession(sessionId);
    return newSessionId;
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const sessionStore = new SessionStore();

// Cleanup expired sessions every hour
setInterval(
  () => {
    sessionStore.cleanupExpiredSessions();
  },
  60 * 60 * 1000,
);
