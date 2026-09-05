#!/usr/bin/env bash
set -Eeuo pipefail

: "${YOUTUBE_RTMP_URL:=rtmp://a.rtmp.youtube.com/live2}"
: "${YOUTUBE_STREAM_KEY:?YOUTUBE_STREAM_KEY is required}"
: "${MEDIA_DIR:?MEDIA_DIR is required}"

playlist="$(mktemp)"
cleanup() {
    rm -f "$playlist"
}
trap cleanup EXIT

shopt -s nullglob
videos=("$MEDIA_DIR"/*.mp4)
if (( ${#videos[@]} == 0 )); then
    echo "No MP4 files found in $MEDIA_DIR" >&2
    exit 1
fi

for video in "${videos[@]}"; do
    printf "file '%s'\n" "${video//\'/\'\\''}" >> "$playlist"
done

exec /usr/bin/ffmpeg \
    -hide_banner -nostdin -loglevel warning \
    -re -stream_loop -1 -f concat -safe 0 -i "$playlist" \
    -map 0:v:0 -map 0:a:0? \
    -c:v libx264 -preset veryfast -tune zerolatency \
    -pix_fmt yuv420p -r 30 -g 60 \
    -b:v 4500k -maxrate 4500k -bufsize 9000k \
    -c:a aac -b:a 128k -ar 44100 \
    -f flv "${YOUTUBE_RTMP_URL%/}/${YOUTUBE_STREAM_KEY}"
