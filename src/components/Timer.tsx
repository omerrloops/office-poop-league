
import React, { useState, useEffect } from 'react';
import { usePoopContext } from '../context/PoopContext';
import { formatTime } from '../context/PoopContext';

const Timer: React.FC = () => {
  const { isPooping, currentSession } = usePoopContext();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPooping && currentSession) {
      // Start the timer
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);
        setElapsed(seconds);
      }, 1000);
    } else {
      // Reset timer when not pooping
      setElapsed(0);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPooping, currentSession]);

  if (!isPooping) return null;

  return (
    <div className="mt-6 text-center">
      <div className="flex items-center justify-center mb-2">
        <div className="w-12 h-12 bg-poop-light rounded-full flex items-center justify-center animate-spin-slow">
          <span className="text-2xl">🧻</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-poop-dark">
        {formatTime(elapsed)}
      </div>
      <p className="text-sm text-poop-dark mt-1 opacity-80">
        Keep it flowing...
      </p>
    </div>
  );
};

export default Timer;
