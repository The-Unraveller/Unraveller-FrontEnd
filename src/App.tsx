import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import Missions from './pages/Missions/Missions';
import Game from './pages/Game/Game';
import Result from './pages/Result/Result';
import About from './pages/About/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-spy-black text-white selection:bg-spy-green selection:text-black font-mono">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/about" element={<About />} />
          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
