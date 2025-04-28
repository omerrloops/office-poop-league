
import React from 'react';
import { PoopProvider } from '../context/PoopContext';
import PoopButton from '../components/PoopButton';
import Timer from '../components/Timer';
import Leaderboard from '../components/Leaderboard';
import WeeklyWinner from '../components/WeeklyWinner';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <PoopProvider>
      <div className="min-h-screen bg-gradient-to-b from-poop-bg to-white">
        <div className="container px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-poop">
              <span className="mr-2">💩</span>
              Poo League
            </h1>
            <div className="flex space-x-4">
              <Link to="/leaderboard" className="text-poop hover:underline">
                Leaderboard
              </Link>
              <Link to="/profile" className="text-poop hover:underline">
                Profile
              </Link>
            </div>
          </header>
          
          <main>
            <div className="flex flex-col items-center justify-center py-8">
              <PoopButton />
              <Timer />
            </div>
            
            <div className="mt-8 space-y-10">
              <WeeklyWinner />
              <Leaderboard compact />
            </div>
          </main>
          
          <footer className="mt-16 text-center text-sm text-gray-500">
            <p>🏆 Poo League - The Ultimate Office Poop Time Tracker 🏆</p>
            <p className="mt-1">New weekly champion crowned every Monday!</p>
          </footer>
        </div>
      </div>
    </PoopProvider>
  );
};

export default Index;
