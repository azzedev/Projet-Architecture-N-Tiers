import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import RankingPage from './pages/RankingPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:sessionCode" element={<GamePage />} />
            <Route path="/ranking/:sessionCode" element={<RankingPage />} />
        </Routes>
    );
}

export default App;
