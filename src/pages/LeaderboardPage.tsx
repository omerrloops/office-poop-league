
import React from 'react';
import { PoopProvider } from '../context/PoopContext';
import Leaderboard from '../components/Leaderboard';
import { Link } from 'react-router-dom';

const LeaderboardPage = () => {
  return (
    <PoopProvider>
      <div className="min-h-screen bg-gradient-to-b from-poop-bg to-white">
        <div className="container px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-poop">
              <Link to="/" className="flex items-center">
                <span className="mr-2">💩</span>
                Poo League
              </Link>
            </h1>
            <div className="flex space-x-4">
              <Link to="/" className="text-poop hover:underline">
                Home
              </Link>
              <Link to="/profile" className="text-poop hover:underline">
                Profile
              </Link>
            </div>
          </header>
          
          <main>
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-poop-dark">The Throne Contenders</h2>
              <p className="text-gray-600">Who will be the next Poop Champion?</p>
            </div>
            
            <Leaderboard />
          </main>
        </div>
      </div>
    </PoopProvider>
  );
};

export default LeaderboardPage;
