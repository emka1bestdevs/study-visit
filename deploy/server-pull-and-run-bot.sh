#!/usr/bin/env bash
set -euo pipefail

# На сервере: задать REPO_DIR и при первом клоне — GIT_REMOTE
REPO_DIR="${REPO_DIR:-/var/www/study-visit}"
GIT_REMOTE="${GIT_REMOTE:-}"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  if [[ -z "$GIT_REMOTE" ]]; then
    echo "Укажите GIT_REMOTE (URL репозитория) или клонируйте репозиторий в REPO_DIR." >&2
    exit 1
  fi
  mkdir -p "$(dirname "$REPO_DIR")"
  git clone "$GIT_REMOTE" "$REPO_DIR"
else
  git -C "$REPO_DIR" pull --ff-only
fi

cd "$REPO_DIR"
npm ci --workspace=telegram-bot

if [[ ! -f "$REPO_DIR/telegram-bot/.env" ]]; then
  echo "Создайте $REPO_DIR/telegram-bot/.env с TELEGRAM_BOT_TOKEN=..." >&2
  exit 1
fi

echo "Локально: cd $REPO_DIR && npm run start --workspace=telegram-bot"
echo "Или: sudo systemctl restart study-visit-telegram-bot"
