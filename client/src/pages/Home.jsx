import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-6xl mx-auto h-[80vh]">
        {/* The image with curved corners */}
        <div className="w-full h-full">
          <img
            src="https://i.pinimg.com/564x/66/62/01/6662017b589bdda3125c9c19551d4085.jpg"
            alt="Health Matrix Background"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-white bg-opacity-70 p-8 rounded-lg text-center">
            <h1 className="text-5xl font-bold text-black">Welcome to HEALTH MATRIX</h1>
            {/* Profile button */}
            <Link to="/profile">
              <button className="mt-6 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition">
                Your Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
