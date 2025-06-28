import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { mockVideos, VideoData } from '../data/mockVideos';

const VideoPlayerPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [video, setVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    const foundVideo = mockVideos.find(v => v.id === videoId);
    if (foundVideo) {
      setVideo(foundVideo);
    } else {
      navigate('/');
    }
  }, [videoId, navigate]);

  useEffect(() => {
    if (video && videoRef.current && !playerRef.current) {
      // Initialize Video.js player
      const player = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [{
          src: video.hlsUrl,
          type: 'application/x-mpegURL'
        }],
        poster: video.thumbnail,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true
          }
        },
        techOrder: ['html5']
      });

      // Enable HLS support
      player.ready(() => {
        console.log('Player is ready');
        if (player.tech().hls) {
          player.tech().hls.xhr.beforeRequest = (options: any) => {
            return options;
          };
        }
      });

      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [video]);

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Library</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Video className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VideoStream Player</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Video Container */}
          <div className="relative bg-black">
            <div data-vjs-player>
              <video
                ref={videoRef}
                className="video-js vjs-default-skin w-full"
                controls
                preload="auto"
                width="1280"
                height="720"
                data-setup="{}"
              />
            </div>
          </div>

          {/* Video Info */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h2>
            <p className="text-gray-600 mb-4">{video.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-medium">Duration:</span>
                <span>{video.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Size:</span>
                <span>{video.size}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Uploaded:</span>
                <span>{new Date(video.uploadDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Videos */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">More Videos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockVideos
              .filter(v => v.id !== video.id)
              .slice(0, 4)
              .map((relatedVideo) => (
                <div
                  key={relatedVideo.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/player/${relatedVideo.id}`)}
                >
                  <div className="relative">
                    <img
                      src={relatedVideo.thumbnail}
                      alt={relatedVideo.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {relatedVideo.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                      {relatedVideo.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(relatedVideo.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayerPage;