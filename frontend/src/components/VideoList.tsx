import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

import { VideoMetadataList } from '../pages/HomePage';

const VideoList = ({ videos }: { videos: VideoMetadataList }) => {
  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-800">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">HLS Video Streams</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {videos.map((video) => (
          <div
            key={video.unique_filename}
            className="bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-700 transition-all duration-300 border border-gray-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">
                  {video.original_filename}
                </h3>
                <div className="text-xs text-gray-400 font-mono bg-gray-700 p-2 rounded break-all sm:truncate">
                  {video.hls_url}
                </div>
              </div>
              
              <Link
                to={`/player/${video.unique_filename}?url=${encodeURIComponent(video.hls_url)}&title=${encodeURIComponent(video.original_filename)}`}
                className="sm:ml-4 bg-blue-600 text-white p-2 sm:p-3 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center self-center sm:self-auto"
              >
                <Play size={16} fill="currentColor" className="sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;