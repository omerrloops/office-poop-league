
import React from 'react';
import { PoopProvider } from '../context/PoopContext';
import UserProfile from '../components/UserProfile';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
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
              <Link to="/leaderboard" className="text-poop hover:underline">
                Leaderboard
              </Link>
            </div>
          </header>
          
          <main>
            <UserProfile />
          </main>
        </div>
      </div>
    </PoopProvider>
  );
};

export default ProfilePage;
