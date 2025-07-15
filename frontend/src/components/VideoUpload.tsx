import React, { useState } from 'react';
import { Upload, Video, X } from 'lucide-react';

interface VideoUploadProps {
  onUpload: (file: File) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('video/')) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-800">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Upload Video</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 ${
          dragOver
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Video className="text-blue-400" size={24} />
              <span className="text-gray-200 font-medium">{selectedFile.name}</span>
              <button
                onClick={removeFile}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto text-gray-500" size={32} />
            <div>
              <p className="text-gray-300 mb-2 text-sm sm:text-base">Drag and drop your video here</p>
              <p className="text-xs sm:text-sm text-gray-500">or</p>
            </div>
            <label className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm sm:text-base">
              Browse Files
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
        >
          Upload & Convert to HLS
        </button>
      )}
    </div>
  );
};

export default VideoUpload;