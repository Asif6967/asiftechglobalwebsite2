#!/usr/bin/env bash
set -Eeuo pipefail

: "${MEDIA_DIR:=/opt/asiftechglobal/media}"
: "${HLS_DIR:=/var/www/asiftechglobal-hls}"

install -d -m 0755 "$HLS_DIR"
rm -f "$HLS_DIR"/*.m3u8 "$HLS_DIR"/*.ts

playlist="$(mktemp)"
trap 'rm -f "$playlist"' EXIT
for video in "$MEDIA_DIR"/*.mp4; do
    printf "file '%s'\n" "$video" >> "$playlist"
done

exec /usr/bin/ffmpeg \
    -hide_banner -nostdin -loglevel warning \
    -re -stream_loop -1 -f concat -safe 0 -i "$playlist" \
    -map 0:v:0 -map 0:a:0? \
    -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -g 60 \
    -b:v 2500k -maxrate 2500k -bufsize 5000k \
    -c:a aac -b:a 128k -ar 44100 \
    -f hls -hls_time 4 -hls_list_size 12 -hls_flags delete_segments+append_list \
    "$HLS_DIR/live.m3u8"
