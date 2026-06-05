#!/bin/bash

INPUT="input.mp4"

# Create output directory
mkdir -p hls_output

echo "Creating 2160p (4K) stream..."
ffmpeg -i "$INPUT" \
  -vf scale=3840:2160 \
  -c:v libx264 -b:v 20000k -maxrate 22000k -bufsize 44000k \
  -c:a aac -b:a 192k -ac 2 \
  -f hls -hls_time 6 -hls_list_size 0 \
  -hls_segment_filename "hls_output/2160p_%03d.ts" \
  hls_output/2160p.m3u8

echo "Creating 1080p stream..."
ffmpeg -i "$INPUT" \
  -vf scale=1920:1080 \
  -c:v libx264 -b:v 5000k -maxrate 5500k -bufsize 11000k \
  -c:a aac -b:a 192k -ac 2 \
  -f hls -hls_time 6 -hls_list_size 0 \
  -hls_segment_filename "hls_output/1080p_%03d.ts" \
  hls_output/1080p.m3u8

echo "Creating 720p stream..."
ffmpeg -i "$INPUT" \
  -vf scale=1280:720 \
  -c:v libx264 -b:v 3000k -maxrate 3300k -bufsize 6600k \
  -c:a aac -b:a 128k -ac 2 \
  -f hls -hls_time 6 -hls_list_size 0 \
  -hls_segment_filename "hls_output/720p_%03d.ts" \
  hls_output/720p.m3u8

echo "Creating 480p stream..."
ffmpeg -i "$INPUT" \
  -vf scale=854:480 \
  -c:v libx264 -b:v 1500k -maxrate 1650k -bufsize 3300k \
  -c:a aac -b:a 96k -ac 2 \
  -f hls -hls_time 6 -hls_list_size 0 \
  -hls_segment_filename "hls_output/480p_%03d.ts" \
  hls_output/480p.m3u8

echo "Creating master playlist..."
cat > hls_output/master.m3u8 << 'EOF'
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=20000000,RESOLUTION=3840x2160,FRAME-RATE=30
2160p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080,FRAME-RATE=30
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720,FRAME-RATE=30
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480,FRAME-RATE=30
480p.m3u8
EOF

echo ""
echo "✅ HLS conversion complete!"
echo "📁 Output folder: hls_output/"
echo "📤 Upload all files in hls_output/ to your R2 bucket"
echo "🔗 Use the master.m3u8 URL in your video player"
