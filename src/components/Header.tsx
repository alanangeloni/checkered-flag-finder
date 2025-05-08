
import React from 'react';
import RacecarLogo from './RacecarLogo';

const Header = () => {
  return (
    <header className="bg-white py-4 px-6 border-b border-gray-200">
      <div className="container mx-auto">
        <RacecarLogo />
      </div>
    </header>
  );
};

export default Header;
