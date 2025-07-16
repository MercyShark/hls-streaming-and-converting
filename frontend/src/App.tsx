import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VideoPlayer from './components/VideoPlayer';
import { dummyVideos } from './data/dummyData';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player/:id" element={<VideoPlayer videos={dummyVideos} />} />
      </Routes>
    </Router>
  );
}

export default App;