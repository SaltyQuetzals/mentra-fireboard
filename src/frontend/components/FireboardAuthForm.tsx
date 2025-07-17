import React, { FormEventHandler } from 'react';

interface FireboardAuthFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
}

function FireboardAuthForm({ onSubmit }: FireboardAuthFormProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-semibold mb-6 text-center text-mentraos-blue">Authenticate with Fireboard</h2>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-mentraos-blue"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-mentraos-blue"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-mentraos-blue text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FireboardAuthForm; 