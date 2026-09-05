#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/asiftechglobal}"
REPOSITORY_URL="${REPOSITORY_URL:-https://github.com/Asif6967/asiftechglobalwebsite2.git}"
SERVICE_NAME="asiftechglobal-live"

if [[ "${EUID}" -ne 0 ]]; then
    echo "Run this installer as root: sudo bash install.sh" >&2
    exit 1
fi

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y ffmpeg git

if ! id -u asiftech >/dev/null 2>&1; then
    useradd --system --home-dir "$APP_DIR" --shell /usr/sbin/nologin asiftech
fi

if [[ ! -d "$APP_DIR/.git" ]]; then
    mkdir -p "$(dirname "$APP_DIR")"
    git clone "$REPOSITORY_URL" "$APP_DIR"
else
    git -C "$APP_DIR" pull --ff-only
fi

install -d -m 0750 -o asiftech -g asiftech /etc/asiftechglobal
install -m 0755 -o root -g root \
    "$APP_DIR/deploy/azure-live-stream/stream-live.sh" \
    /usr/local/bin/asiftechglobal-live
install -m 0644 -o root -g root \
    "$APP_DIR/deploy/azure-live-stream/asiftechglobal-live.service" \
    "/etc/systemd/system/${SERVICE_NAME}.service"

if [[ ! -f /etc/asiftechglobal/live-stream.env ]]; then
    cat > /etc/asiftechglobal/live-stream.env <<'EOF'
# Keep this file private. Do not commit or expose the stream key.
YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2
YOUTUBE_STREAM_KEY=REPLACE_WITH_YOUTUBE_STREAM_KEY
EOF
    chmod 600 /etc/asiftechglobal/live-stream.env
    chown root:root /etc/asiftechglobal/live-stream.env
    echo "Set YOUTUBE_STREAM_KEY in /etc/asiftechglobal/live-stream.env, then run:"
    echo "  systemctl enable --now ${SERVICE_NAME}"
    exit 0
fi

systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}"
systemctl --no-pager --full status "${SERVICE_NAME}"
