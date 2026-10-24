ALTER TABLE users
  ADD COLUMN telegram_chat_id VARCHAR(64) NULL UNIQUE AFTER phone,
  ADD COLUMN telegram_link_code_hash CHAR(64) NULL AFTER telegram_chat_id,
  ADD COLUMN telegram_link_expires_at DATETIME NULL AFTER telegram_link_code_hash;