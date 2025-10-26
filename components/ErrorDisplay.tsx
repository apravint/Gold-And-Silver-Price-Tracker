
import React from 'react';

interface ErrorDisplayProps {
    message: string;
    onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-6 py-4 rounded-lg text-center max-w-md">
             <div className="flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-bold">Error</p>
            </div>
            <p className="mb-4">{message}</p>
            <button
                onClick={onRetry}
                className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-200"
            >
                Try Again
            </button>
        </div>
    );
};

export default ErrorDisplay;
