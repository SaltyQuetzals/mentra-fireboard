import React from 'react';

function NotAuthenticatedScreen() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 className="text-red-600 text-2xl font-semibold mb-4">Not Authenticated</h2>
        <p className="text-gray-700">Please open this page from the MentraOS manager app to view live transcripts.</p>
      </div>
    </div>
  );
}

export default NotAuthenticatedScreen; 