import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import Missions from './pages/Missions/Missions';
import Game from './pages/Game/Game';
import Result from './pages/Result/Result';
import About from './pages/About/About';
import Premium from './pages/Premium/Premium';
import Badges from './pages/Badges/Badges';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/missions" element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<Missions />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/about" element={<About />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/badges" element={<Badges />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
