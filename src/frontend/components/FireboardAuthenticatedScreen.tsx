import React from 'react';

function FireboardAuthenticatedScreen() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-semibold mb-6 text-center text-mentraos-blue">
            You have authenticated with Fireboard
          </h2>
          <p className="text-center text-gray-700">
            You should now be able to use the MentraOS app on your glasses!
          </p>
          <p>
            You do not need to authenticate again unless asked to do so.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FireboardAuthenticatedScreen; 