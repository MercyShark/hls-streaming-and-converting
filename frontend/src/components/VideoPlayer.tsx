import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';
import { ArrowLeft } from 'lucide-react';

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  const hlsUrl = searchParams.get('url');
  const videoTitle = searchParams.get('title') || id || 'Video';

  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    // Wait a bit for the DOM to be ready
    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      // Initialize Video.js player
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        preload: 'metadata',
        sources: [{
          src: hlsUrl,
          type: 'application/x-mpegURL'
        }],
        html5: {
          hls: {
            overrideNative: true
          }
        }
      });

      // Add ready callback
      playerRef.current.ready(() => {
        console.log('Video.js player is ready');
      });

      // Add error handling
      playerRef.current.on('error', () => {
        console.error('Video.js player error:', playerRef.current.error());
      });
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [hlsUrl]);

  if (!hlsUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Video URL Provided</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-3 sm:p-4">
        <div className="container mx-auto flex items-center justify-between px-2 sm:px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
            <span>Back to Videos</span>
          </button>
          <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-white truncate max-w-32 sm:max-w-md ml-2">
            {videoTitle}
          </h1>
        </div>
      </div>

      {/* Video Player */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video">
              <video
                ref={videoRef}
                className="video-js vjs-default-skin w-full h-full"
                controls
                preload="auto"
                width="100%"
                height="100%"
                data-setup='{"fluid": true}'
              />
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-300 text-xs sm:text-sm">
              <strong>Stream URL:</strong> 
              <span className="font-mono text-blue-400 ml-1 sm:ml-2 break-all">{hlsUrl}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;