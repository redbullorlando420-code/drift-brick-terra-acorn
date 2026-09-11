CREATE TABLE IF NOT EXISTS reelcase_network_presence (
  scope TEXT NOT NULL,
  device_id TEXT NOT NULL,
  label TEXT NOT NULL,
  device_kind TEXT NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (scope, device_id)
);

CREATE INDEX IF NOT EXISTS reelcase_network_presence_active
  ON reelcase_network_presence (scope, last_seen DESC);
