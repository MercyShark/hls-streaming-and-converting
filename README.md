# HLS Video Streamer
## System Design
![alt text](/docs/system_design.svg)
A modern video streaming platform that converts uploaded videos to HLS format for optimized delivery across devices.

## ✨ Features

- **Video Upload & HLS Conversion**: Upload videos with automatic HLS processing
- **Real-time Updates**: WebSocket notifications for conversion progress
- **Adaptive Streaming**: Multiple quality streams for different network conditions
- **Modern UI**: Responsive React frontend with dark theme
- **Cloud Storage**: Cloudflare R2 integration for scalable file storage

## 🛠️ Tech Stack

**Frontend:** React + TypeScript + Tailwind CSS  
**Backend:** FastAPI + MongoDB + Redis + RabbitMQ  
**Storage:** Cloudflare R2 Bucket  
**Processing:** FFmpeg for video conversion

