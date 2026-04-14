import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketEngine } from '../services/marketEngineService';
import { useAuth } from './AuthContext';

interface MarketContextType {
    trustScore: number;
    areaStats: any;
    isCalculating: boolean;
    refreshTrust: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [trustScore, setTrustScore] = useState(50);
    const [areaStats, setAreaStats] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const refreshTrust = async () => {
        if (!user?.id) return;
        const score = await marketEngine.computeUserTrustScore(user.id);
        setTrustScore(score);
    };

    useEffect(() => {
        const initMarketData = async () => {
            if (!user) return;
            setIsCalculating(true);
            try {
                const [score, stats] = await Promise.all([
                    marketEngine.computeUserTrustScore(user.id),
                    marketEngine.getAreaStatistics(user.area || 'Phase 1')
                ]);
                setTrustScore(score);
                setAreaStats(stats);
            } finally {
                setIsCalculating(false);
            }
        };

        initMarketData();
    }, [user]);

    return (
        <MarketContext.Provider value={{
            trustScore,
            areaStats,
            isCalculating,
            refreshTrust
        }}>
            {children}
        </MarketContext.Provider>
    );
};

export const useMarket = () => {
    const context = useContext(MarketContext);
    if (!context) throw new Error('useMarket must be used within MarketProvider');
    return context;
};
