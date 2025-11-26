import React from 'react';
import CONSTANTS from '../constants.json';

const Footer = () => {
  return (
    <footer className="bg-primary2 py-1.5 flex flex-col items-center gap-1">
      <div className="text-white font-semibold text-xs text-center">
        Developed by{' '}
        <a
          href="https://innobles.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-secondary"
        >
          Innobles Smart Technologies Pvt Ltd
        </a>
      </div>
      <div className="text-white font-semibold text-xs max-w-xl text-center uppercase drop-shadow-sm">
        {CONSTANTS.SDA_ADDRESS}
      </div>
    </footer>
  );
};

export default Footer;
