import React, { useState, useEffect, useCallback } from 'react';
import { CommodityPrice } from './types';
import { fetchPrices } from './services/geminiService';
import Header from './components/Header';
import PriceCard from './components/PriceCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
    const [prices, setPrices] = useState<CommodityPrice[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const getPrices = useCallback(async () => {
        // For subsequent refreshes, don't set loading to true for the main content
        // only for the refresh icon. The `isLoading && !prices` check handles this.
        setIsLoading(true);
        setError(null);
        try {
            const fetchedPrices = await fetchPrices();
            setPrices(fetchedPrices);
            setLastUpdated(new Date());
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
            // Keep stale data on refresh error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getPrices(); // Initial fetch
        const intervalId = setInterval(getPrices, 5000); // Refresh every 5 seconds

        return () => {
            clearInterval(intervalId); // Cleanup on component unmount
        };
    }, [getPrices]);

    const renderContent = () => {
        // Show spinner only on initial load when there are no prices yet
        if (isLoading && !prices) {
            return <LoadingSpinner />;
        }
        
        // Show error message if an error occurred and we have no data
        if (error && !prices) {
            return <ErrorDisplay message={error} onRetry={getPrices} />;
        }

        // Show price cards if data is available (even during a background refresh)
        if (prices) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                    {prices.map((priceData) => (
                        <PriceCard key={priceData.metal} data={priceData} />
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 md:p-8 selection:bg-yellow-500/30">
            <Header onRefresh={getPrices} isRefreshing={isLoading && !!prices} />
            <main className="flex-grow flex flex-col items-center justify-center w-full px-4 text-center">
                {renderContent()}
            </main>
            <footer className="w-full text-center p-4 mt-8">
                {lastUpdated && !error ? (
                     <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                    </p>
                ) : (
                    <p className="text-sm text-gray-500">Connecting...</p>
                )}
                <p className="text-xs text-gray-600 mt-2">Powered by Google Gemini</p>
            </footer>
        </div>
    );
};

export default App;