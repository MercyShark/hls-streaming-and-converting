import React, { useEffect, useState } from 'react';
import { Video } from 'lucide-react';
import VideoUpload from '../components/VideoUpload';
import VideoList from '../components/VideoList';
import Notification from '../components/Notification';
import { generatePresignedUrl, uploadFileToS3, uploadFileMetadata, getVideos } from '../api';

export interface VideoMetadata {
  original_filename: string;
  unique_filename: string;
  content_type: string;
  file_size: string;
  upload_time: string;
  hls_url: string;
}

export type VideoMetadataList = VideoMetadata[];

const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<VideoMetadataList[]>([]);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_BACKEND_WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);
        
        // Show notification for any message
        if (data.type === 'conversion_complete') {
          console.log('Video conversion completed:', data);
          setNotification({
            show: true,
            message: `Video conversion completed for ${data.filename || 'your video'}!`
          });
          // fetchVideos();
        } else if (data.message) {
          setNotification({
            show: true,
            message: data.message
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return () => ws.close();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const videoList = await getVideos();
      setVideos(videoList);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoUpload = async (file: File) => {
    console.log(file)
    if(!file) return;
    try{
      setIsLoading(true);
      const presignedRes = await generatePresignedUrl(file.name, file.type)
      const { presigned_url, path } = presignedRes;
      const uploadRes = await uploadFileToS3(file,presigned_url);
      if(uploadRes) {
        const metadataRes = await uploadFileMetadata(file.name, file.type, file.size, path);
        if(metadataRes) {
          console.log("File uploaded successfully");
          setNotification({
            show: true,
            message: `Video "${file.name}" uploaded successfully! Processing will start shortly.`
          });
        } else {
          console.error("Failed to upload file metadata");
        }
      }
    }catch(error) {
      console.error("Error during upload:", error);
    }finally {
      setIsLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ show: false, message: '' });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Video className="text-blue-400 mr-2 sm:mr-3" size={32} />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">HLS Video Streamer</h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg px-4">
            Upload, convert, and stream your videos with HLS technology
          </p>
        </div>

        {/* Upload Section */}
        <VideoUpload onUpload={handleVideoUpload} />

        {/* Video List */}
        <VideoList videos={videos} />

        {/* Notification */}
        <Notification
          message={notification.message}
          show={notification.show}
          onClose={handleCloseNotification}
        />
      </div>
    </div>
  );
};

export default HomePage;