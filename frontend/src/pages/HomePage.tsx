import React, { useState } from 'react';
import { Video } from 'lucide-react';
import VideoUpload from '../components/VideoUpload';
import VideoList from '../components/VideoList';
import { mockVideos } from '../data/mockVideos';

const HomePage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const handleVideoSelect = (file: File) => {
    setSelectedVideo(file);
  };

  const handleClearVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Video className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VideoStream</h1>
              <p className="text-gray-600">Upload and stream your videos with HLS technology</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VideoUpload
          onVideoSelect={handleVideoSelect}
          selectedVideo={selectedVideo}
          onClearVideo={handleClearVideo}
        />
        
        <VideoList videos={mockVideos} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 VideoStream. Built with React, Video.js, and HLS streaming technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;