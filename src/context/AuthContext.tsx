import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile, UserRole, ListingCategory } from '../types';

interface AuthContextType {
    user: UserProfile | null;
    role: UserRole;
    listingCategory: ListingCategory;
    isLoading: boolean;
    login: (phone: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<void>;
    completeProfile: (profile: Partial<UserProfile>) => Promise<void>;
    setRole: (role: UserRole) => void;
    setListingCategory: (category: ListingCategory) => void;
    logout: () => void;
    bypassAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [role, setRoleState] = useState<UserRole>(null);
    const [listingCategory, setListingCategoryState] = useState<ListingCategory>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (phone: string) => {
        setIsLoading(true);
        // Mock login logic
        console.log('Logging in with:', phone);
        setTimeout(() => setIsLoading(false), 1000);
    };

    const verifyOtp = async (otp: string) => {
        setIsLoading(true);
        // Mock OTP verification
        console.log('Verifying OTP:', otp);
        setTimeout(() => {
            setIsLoading(false);
            // In a real app, check if user exists in DB
            // If not, redirect to Role Selection
        }, 1000);
    };

    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        if (user) {
            setUser({ ...user, role: newRole });
        }
    };

    const setListingCategory = (category: ListingCategory) => {
        setListingCategoryState(category);
        if (user) {
            setUser({ ...user, listingCategory: category });
        }
    };

    const completeProfile = async (profile: Partial<UserProfile>) => {
        setIsLoading(true);
        // Mock profile creation
        const newUser: UserProfile = {
            id: '1',
            name: profile.name || '',
            phone: profile.phone || '',
            role: role,
            listingCategory: listingCategory,
            area: profile.area || 'Phase 1',
            ...profile
        };
        setUser(newUser);
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        setRoleState(null);
        setListingCategoryState(null);
    };

    const bypassAuth = () => {
        const mockUser: UserProfile = {
            id: 'bypass-user',
            name: 'Guest User',
            phone: '9999999999',
            role: 'tenant',
            listingCategory: null,
            area: 'Phase 1'
        };
        setRoleState('tenant');
        setListingCategoryState(null);
        setUser(mockUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            role,
            listingCategory,
            isLoading,
            login,
            verifyOtp,
            completeProfile,
            setRole,
            setListingCategory,
            logout,
            bypassAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
