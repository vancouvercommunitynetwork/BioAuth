import session from 'express-session';
import BetterSqlite3Store from 'better-sqlite3-session-store';
import Database from 'better-sqlite3';
import path from 'node:path';
import { config } from '../config.js';
import { ensureDir } from '../utils/fs.js';

const SqliteStore = BetterSqlite3Store(session);

// Ensure /data directory exists
const sessionDir = path.dirname(config.dbPath);
const sessionDbPath = path.join(sessionDir, 'sessions.sqlite');
ensureDir(sessionDbPath);

const db = new Database(sessionDbPath);

const store = new SqliteStore({
  client: db,
  expired: {
    clear: true,
    intervalMs: 15 * 60 * 1000, // clear expired sessions every 15 minutes
  },
});

// Configuration for middleware function
export const sessionMiddleware = session({
  store,
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  // Rules for session cookie
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv !== 'development' ? true : false,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});
