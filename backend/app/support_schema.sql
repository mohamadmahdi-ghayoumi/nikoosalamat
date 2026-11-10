CREATE TABLE IF NOT EXISTS support_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), enabled INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO support_settings (id, enabled) VALUES (1, 0);
CREATE TABLE IF NOT EXISTS support_conversations (
    id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, closed INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('visitor', 'staff')),
    text TEXT NOT NULL, created_at INTEGER NOT NULL, client_id TEXT NOT NULL,
    telegram_chat TEXT, telegram_id INTEGER,
    attempts INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL DEFAULT 0,
    lease_until INTEGER NOT NULL DEFAULT 0,
    UNIQUE(conversation_id, client_id), UNIQUE(telegram_chat, telegram_id)
);
CREATE INDEX IF NOT EXISTS support_message_history ON support_messages(conversation_id, id);
CREATE INDEX IF NOT EXISTS support_message_outbox ON support_messages(role, next_attempt, lease_until);
CREATE TABLE IF NOT EXISTS support_updates (id INTEGER PRIMARY KEY, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS support_limits (
    bucket TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
