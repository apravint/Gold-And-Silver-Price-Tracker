import React from 'react';
import { CommodityPrice, Metal } from '../types';

const GoldIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-400">
        <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 7H21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SilverIcon = () => (
     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);


interface PriceCardProps {
    data: CommodityPrice;
}

const PriceCard: React.FC<PriceCardProps> = ({ data }) => {
    const { metal, price, currency, unit, change } = data;

    const isPositive = change >= 0;
    const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
    const cardGradient = metal === Metal.Gold
        ? 'from-yellow-500/10 via-gray-900 to-gray-900'
        : 'from-gray-500/10 via-gray-900 to-gray-900';
    const borderColor = metal === Metal.Gold ? 'border-yellow-500/20' : 'border-gray-500/20';
    const shadowColor = metal === Metal.Gold ? 'hover:shadow-yellow-500/20' : 'hover:shadow-blue-500/20';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className={`bg-gradient-to-br ${cardGradient} p-6 rounded-2xl shadow-lg border ${borderColor} transition-all duration-300 ${shadowColor} hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-white">{metal}</h2>
                {metal === Metal.Gold ? <GoldIcon /> : <SilverIcon />}
            </div>
            
            <div className="text-left">
                <p className="text-5xl font-bold tracking-tight text-white mb-1 font-mono">
                    {formatCurrency(price)}
                </p>
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">{unit}</p>
            </div>
            
            <div className={`mt-6 text-xl font-semibold ${changeColor} flex items-center justify-start`}>
                <span className="mr-2">
                    {isPositive ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    )}
                </span>
                <span>{change.toFixed(2)}%</span>
                <span className="text-sm text-gray-500 ml-2 font-normal">(24h)</span>
            </div>
        </div>
    );
};

export default PriceCard;