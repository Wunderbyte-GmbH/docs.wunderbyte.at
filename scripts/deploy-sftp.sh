#!/usr/bin/env bash

set -euo pipefail

HOST="${SFTP_HOST:-dedi458.your-server.de}"
PORT="${SFTP_PORT:-22}"
USER_NAME="${SFTP_USER:-wunder_4}"
REMOTE_DIR="${SFTP_REMOTE_DIR:-/}"

if [[ -n "${SFTP_PASSWORD:-}" ]]; then
  PASSWORD="$SFTP_PASSWORD"
elif [[ -f "${HOME}/.sftp" ]]; then
  PASSWORD="$(sed -n '2p' "${HOME}/.sftp" | tr -d '\r')"
else
  echo "Missing SFTP password. Set SFTP_PASSWORD or create ~/.sftp with the password on line 2." >&2
  exit 1
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp is required for deployment." >&2
  exit 1
fi

lftp -u "${USER_NAME},${PASSWORD}" "sftp://${HOST}:${PORT}" <<EOF
set cmd:fail-exit yes
set sftp:auto-confirm yes
mirror --reverse --delete --verbose build ${REMOTE_DIR}
bye
EOF
