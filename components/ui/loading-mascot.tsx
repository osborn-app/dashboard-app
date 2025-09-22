"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface LoadingMascotProps {
  message?: string;
  showProgress?: boolean;
  duration?: number;
}

export default function LoadingMascot({ 
  message = "Memproses...", 
  showProgress = true,
  duration = 2000 
}: LoadingMascotProps) {
  const [progress, setProgress] = useState(0);
  const [currentMascot, setCurrentMascot] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Rotate mascot every 500ms
    const mascotInterval = setInterval(() => {
      setCurrentMascot((prev) => (prev % 3) + 1);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(mascotInterval);
    };
  }, [duration]);

  const getMascotSrc = () => {
    switch (currentMascot) {
      case 1: return "/30.png";
      case 2: return "/31.png";
      case 3: return "/32.png";
      default: return "/30.png";
    }
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Mascot Animation */}
        <div className="mb-6 relative">
          <div className="animate-bounce">
            <Image
              src={getMascotSrc()}
              alt="Loading Mascot"
              width={120}
              height={120}
              className="mx-auto animate-pulse"
            />
          </div>
          
          {/* Floating dots around mascot */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300"></div>
          <div className="absolute top-1/2 -left-4 w-2 h-2 bg-blue-300 rounded-full animate-ping delay-700"></div>
        </div>

        {/* Loading Message */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {message}
        </h3>
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Progress Text */}
        {showProgress && (
          <p className="text-sm text-gray-600">
            {progress}% selesai
          </p>
        )}

        {/* Loading dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}
