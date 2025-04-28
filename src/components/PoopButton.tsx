
import React from 'react';
import { usePoopContext } from '../context/PoopContext';

const PoopButton: React.FC = () => {
  const { isPooping, startPooping, stopPooping } = usePoopContext();

  const handleClick = () => {
    if (isPooping) {
      stopPooping();
    } else {
      startPooping();
    }
  };

  return (
    <button 
      className={`poop-button ${isPooping ? 'poop-button-active' : ''}`}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center">
        <span className="text-5xl mb-2">{isPooping ? '🧻' : '💩'}</span>
        <span className="text-xl font-bold">
          {isPooping ? 'Stop Pooping' : 'Start Pooping'}
        </span>
      </div>
    </button>
  );
};

export default PoopButton;
