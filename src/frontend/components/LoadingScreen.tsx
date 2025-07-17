import React from 'react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-3 border-gray-300 border-t-mentraos-blue rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading authentication...</p>
      </div>
    </div>
  );
}

export default LoadingScreen; 