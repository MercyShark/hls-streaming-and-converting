import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Replace with your base URL
  timeout: 10000,                      // Optional: request timeout (in ms)
  headers: {
    'Content-Type': 'application/json',
  }
});

export const generatePresignedUrl = async (fileName: string, mimeType: string) => {
  try {
    const response = await axiosInstance.post("/generate-presigned-url/", {
      filename: fileName,
      mime_type: mimeType
    });
    return response.data;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
};

export const uploadFileToS3 = async (file: File, presignedUrl: string) => {
  try {
    const response = await axiosInstance.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};


export const uploadFileMetadata = async (fileName: string, mimeType: string, fileSize: number, uniqueFileName: string) => { 
     try {
    const response = await axiosInstance.post('/upload/complete/', {
        filename: fileName,
        mime_type: mimeType,
        size: fileSize,
        unique_filename: uniqueFileName
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};


export const getVideos = async () => { 
  try {
    const response = await axiosInstance.get('/files/all');
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
}