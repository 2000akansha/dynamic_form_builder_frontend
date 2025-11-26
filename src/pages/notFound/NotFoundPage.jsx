import React from 'react';
import { Link } from 'react-router-dom';
import notFoundAnimation from './notFoundAnimation.json';
import Lottie from 'lottie-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary2 opacity-30 rounded-full blur-3xl -top-16 -left-20"></div>
        <div className="absolute w-80 h-80 bg-secondary opacity-40 rounded-full blur-2xl -bottom-24 -right-24"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center p-5">
        {/* Animation Container */}
        <div className="w-full h-80 m-[-75px]">
          <Lottie animationData={notFoundAnimation} loop={true} />
        </div>

        {/* Text Content */}
        <div className="relative">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Oops! Page Not Found
          </h2>
          <p
            className="text-lg font-light mb-8 max-w-xl leading-relaxed"
            style={{ color: '#373D60' }}
          >
            We’re sorry, but the page you were looking for doesn’t exist. It
            might have been removed, renamed, or is temporarily unavailable.
            Let’s help you find your way back.
          </p>

          {/* Navigation Button */}
          <Link
            to="/index"
            className="px-8 py-2 text-lg font-semibold text-white rounded-lg shadow-md"
            style={{ backgroundColor: '#373D60' }}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
