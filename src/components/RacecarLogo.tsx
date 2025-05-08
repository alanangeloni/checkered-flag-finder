
import React from 'react';
import { Link } from 'react-router-dom';

interface RacecarLogoProps {
  variant?: 'light' | 'dark';
}

const RacecarLogo: React.FC<RacecarLogoProps> = ({ variant = 'dark' }) => {
  return (
    <Link to="/" className="inline-block">
      <div className="flex items-center">
        <h1 className={`text-xl font-bold ${variant === 'light' ? 'text-white' : 'text-black'}`}>
          RACECAR <span className="text-racecar-red">FINDER</span>
          <sup className="text-xs">TM</sup>
        </h1>
      </div>
    </Link>
  );
};

export default RacecarLogo;
