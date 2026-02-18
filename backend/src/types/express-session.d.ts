import "express-session";
import type {Session, SessionData} from 'express-session'

declare module "express-session" {
  interface SessionData {
    gsub: string;
    authenticated: boolean
  }
}

export type UserSession = Session & Partial<SessionData>