import React, { useState, useRef } from 'react';
import { Upload, X, Play } from 'lucide-react';
import { generatePresignedUrl, uploadFileToS3, uploadFileMetadata } from '../api'; // Adjust the import path as necessary


interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  selectedVideo: File | null;
  onClearVideo: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoSelect, selectedVideo, onClearVideo }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleClick = async () => { 
    if(!selectedVideo) return;
    try{
      setIsLoading(true);
      const presignedRes = await generatePresignedUrl(selectedVideo.name, selectedVideo.type)
      const { presigned_url, path } = presignedRes;
      const uploadRes = await uploadFileToS3(selectedVideo,presigned_url);
      if(uploadRes) {
        const metadataRes = await uploadFileMetadata(selectedVideo.name, selectedVideo.type, selectedVideo.size, path);
        if(metadataRes) {
          console.log("File uploaded successfully");
          onClearVideo(); // Clear the video after successful upload
        } else {
          console.error("Failed to upload file metadata");
        }
      }
    }catch(error) {
      console.error("Error during upload:", error);
    }finally {
      setIsLoading(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        onVideoSelect(file);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Upload className="text-emerald-600" size={28} />
        Upload Video
      </h2>

      {!selectedVideo ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-emerald-100 rounded-full">
              <Upload className="text-emerald-600" size={32} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your video here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, MOV, AVI and other video formats
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Play className="text-emerald-600" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{selectedVideo.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedVideo.size)} • {selectedVideo.type}
                </p>
              </div>
            </div>
            <button
              onClick={onClearVideo}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <video
              src={URL.createObjectURL(selectedVideo)}
              controls
              className="w-full max-w-md mx-auto rounded-lg"
              style={{ maxHeight: '300px' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mt-6">
            <button className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors" disabled={isLoading} onClick={handleClick}>
              Upload Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;