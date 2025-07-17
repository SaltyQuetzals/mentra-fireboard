import React from 'react';

interface ErrorScreenProps {
  error: string;
}

function ErrorScreen({ error }: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 className="text-red-600 text-2xl font-semibold mb-4">Authentication Error</h2>
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <p className="text-gray-600 text-sm">
          Please ensure you are opening this page from the MentraOS app.
        </p>
      </div>
    </div>
  );
}

export default ErrorScreen; 