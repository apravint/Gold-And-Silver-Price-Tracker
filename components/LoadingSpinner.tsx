
import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent border-solid rounded-full animate-spin"></div>
            <p className="text-lg text-gray-300">Fetching latest prices...</p>
        </div>
    );
};

export default LoadingSpinner;
