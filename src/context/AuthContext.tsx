import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile, UserRole, ListingCategory } from '../types';
import { supabase } from '../supabase/supabaseClient';

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
    const [phone, setPhone] = useState<string>('');

    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUserProfile(session.user.id);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            if (data) {
                setUser(data);
                setRoleState(data.role);
                setListingCategoryState(data.listing_category);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const login = async (phone: string) => {
        setIsLoading(true);
        setPhone(phone);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: `+91${phone}`,
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (otp: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: `+91${phone}`,
                token: otp,
                type: 'sms',
            });
            if (error) throw error;
            
            // Check if user profile exists, if not redirect to role selection
            if (data.user) {
                const { data: existingProfile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                    
                if (!existingProfile) {
                    // New user - will need to complete profile
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
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
        try {
            // Get current auth user
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            if (!authUser) {
                throw new Error('No authenticated user found');
            }

            const newUser: UserProfile = {
                id: authUser.id,
                name: profile.name || '',
                phone: profile.phone || phone,
                role: role,
                listingCategory: listingCategory,
                area: profile.area || 'Phase 1',
                ...profile
            };

            // Save to Supabase
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: authUser.id,
                    name: profile.name,
                    phone: profile.phone || phone,
                    role: role,
                    listing_category: listingCategory,
                    area: profile.area || 'Phase 1',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
            setUser(newUser);
        } catch (error) {
            console.error('Error creating profile:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
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
