import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, HardDrive, Clock } from 'lucide-react';
import { VideoData } from '../data/mockVideos';

interface VideoListProps {
  videos: VideoData[];
}

const VideoList: React.FC<VideoListProps> = ({ videos }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/player/${videoId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Play className="text-emerald-600" size={28} />
        Video Library
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleVideoClick(video.id)}
          >
            <div className="relative overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                <div className="bg-emerald-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                {video.duration}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(video.uploadDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{video.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive size={12} />
                    <span>{video.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;