import React from 'react';

interface HeaderProps {
    onRefresh: () => void;
    isRefreshing: boolean;
}

const RefreshIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
    return (
        <header className="w-full max-w-5xl text-center mb-8 sm:mb-12 relative">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">
                Gold & Silver Price Tracker
            </h1>
            <p className="mt-3 text-lg text-gray-400">
                Live prices from the global markets.
            </p>
             <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="absolute top-1/2 -translate-y-1/2 right-0 p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh prices"
            >
                <RefreshIcon className={`h-6 w-6 ${isRefreshing ? 'animate-spin-slow' : ''}`} />
            </button>
        </header>
    );
};

export default Header;