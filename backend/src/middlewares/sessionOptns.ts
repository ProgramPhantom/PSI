import type { CookieOptions, SessionOptions } from 'express-session'
import config from '../config/config.js'

const cookie: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv != 'development',
    maxAge: 600000000
}

export const sessionOptns: SessionOptions = {
    cookie: cookie,
    rolling: true,
    secret: config.sessionSecret

    
    
}

