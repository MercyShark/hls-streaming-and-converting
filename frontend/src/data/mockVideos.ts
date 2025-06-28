export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  hlsUrl: string;
  duration: string;
  uploadDate: string;
  size: string;
}

export const mockVideos: VideoData[] = [
  {
    id: '1',
    title: 'Nature Documentary: Forest Life',
    description: 'Explore the fascinating world of forest ecosystems and wildlife.',
    thumbnail: 'https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg?auto=compress&cs=tinysrgb&w=800',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    duration: '12:34',
    uploadDate: '2024-01-15',
    size: '245 MB'
  },
  {
    id: '2',
    title: 'Ocean Waves & Relaxation',
    description: 'Peaceful ocean sounds and stunning coastal views for relaxation.',
    thumbnail: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    duration: '8:45',
    uploadDate: '2024-01-12',
    size: '189 MB'
  },
  {
    id: '3',
    title: 'Urban Architecture Tour',
    description: 'A cinematic journey through modern urban architecture.',
    thumbnail: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    duration: '15:22',
    uploadDate: '2024-01-10',
    size: '356 MB'
  },
  {
    id: '4',
    title: 'Mountain Hiking Adventure',
    description: 'Epic mountain trails and breathtaking summit views.',
    thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    duration: '18:56',
    uploadDate: '2024-01-08',
    size: '423 MB'
  },
  {
    id: '5',
    title: 'City Lights Time-lapse',
    description: 'Beautiful time-lapse of city lights from dusk to dawn.',
    thumbnail: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=800',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    duration: '6:12',
    uploadDate: '2024-01-05',
    size: '134 MB'
  },
  {
    id: '6',
    title: 'Wildlife Safari Experience',
    description: 'Close encounters with exotic wildlife in their natural habitat.',
    thumbnail: 'https://images.pexels.com/photos/235907/pexels-photo-235907.jpeg?auto=compress&cs=tinysrgb&w=800',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    duration: '22:18',
    uploadDate: '2024-01-03',
    size: '512 MB'
  }
];