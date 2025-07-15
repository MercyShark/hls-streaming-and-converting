export interface VideoStream {
  id: string;
  title: string;
  hlsUrl: string;
}

export const dummyVideos: VideoStream[] = [
  {
    id: '1',
    title: 'Sample Nature Documentary',
    hlsUrl: 'https://pub-164b0863ab2f4990b6a68e1489cccbc0.r2.dev/hls/f1e5c1bd-8e06-411a-afa1-d515732b6509_iot_project/master.m3u8'
  },
  {
    id: '2',
    title: 'Big Buck Bunny - Animated Short',
    hlsUrl: 'https://pub-164b0863ab2f4990b6a68e1489cccbc0.r2.dev/hls/f56934a3-1d9c-422f-b1fb-56e3147f6f10_Shawn_Mendes_Camila_Cabello_Se%C3%B1orita/master.m3u8'
  },
  {
    id: '3',
    title: 'Ocean Waves Relaxation',
    hlsUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
  },
  {
    id: '4',
    title: 'City Timelapse 4K',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
  },
  {
    id: '5',
    title: 'Mountain Adventure',
    hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
  },
  {
    id: '6',
    title: 'Sunset Beach Walk',
    hlsUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
  }
];