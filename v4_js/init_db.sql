PRAGMA journal_mode = wal;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY,
  username TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS sessions (
  session TEXT NOT NULL,
  user_id INT DEFAULT 0 NOT NULL,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY(session, user_id)
);

CREATE TABLE IF NOT EXISTS game (
  id INT PRIMARY KEY,
  south_user_id INT DEFAULT 0 NOT NULL,
  north_user_id INT DEFAULT 0 NOT NULL,
  start_position TEXT NOT NULL,
  south_time INT,
  north_time INT,
  south_inc INT,
  north_inc INT,
  result INT,
  result_reason INT,
  event_id INT,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS move (
  game_id INT,
  ply TEXT,
  side INT,
  move TEXT,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY(game_id, ply)
);

CREATE TABLE IF NOT EXISTS event (
  id INT PRIMARY KEY,
  name TEXT,
  description TEXT,
  date_start TEXT,
  date_end TEXT,
  url TEXT,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS position (
  id INTEGER PRIMARY KEY,
  user_id INT DEFAULT 0,
  name TEXT DEFAULT "anonymous",
  position_string TEXT NOT NULL,
  public boolean DEFAULT true,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, position_string) ON CONFLICT ABORT
);
