import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile, UserRole, ListingCategory } from '../types';
import { supabase } from '../supabase/supabaseClient';

interface AuthContextType {
    user: UserProfile | null;
    role: UserRole;
    listingCategory: ListingCategory;
    isLoading: boolean;
    login: (phone: string) => Promise<void>;
    loginWithEmail: (email: string, password?: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<void>;
    completeProfile: (profile: Partial<UserProfile>) => Promise<void>;
    updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
    setRole: (role: UserRole) => Promise<void>;
    setListingCategory: (category: ListingCategory) => Promise<void>;
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
            // Test numbers that always work without sending SMS
            const testNumbers = ['9999999999', '8888888888', '7777777777'];
            if (testNumbers.includes(phone)) {
                console.log('Using test number, skipping SMS send');
                return;
            }

            const { error } = await supabase.auth.signInWithOtp({
                phone: `+91${phone}`,
            });

            if (error) {
                // If it's a provider issue, we log it and allow navigation to OTP screen for mock testing
                if (error.message.includes('Unsupported phone provider') || error.message.includes('Sms service could not be initialized')) {
                    console.warn('Phone Provider issue. Proceeding with mock mode.');
                    return;
                }
                throw error;
            }
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            // Allow proceeding to OTP screen even on provider errors for development
            if (error.message?.includes('provider') || error.message?.includes('Sms')) return;
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithEmail = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            // For now, if no password, we treat as "Guest/Magic" login for Hinjewadi Connect simplicity
            // or we use a default password if we want to bypass real email auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: password || 'Test123456',
            });

            if (error) {
                // If user doesn't exist, try to sign up
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password: password || 'Test123456',
                });

                if (signUpError) throw signUpError;
                if (signUpData.user) await fetchUserProfile(signUpData.user.id);
            } else {
                if (data.user) await fetchUserProfile(data.user.id);
            }
        } catch (error) {
            console.error('Email Login Error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (otp: string) => {
        setIsLoading(true);
        try {
            // MASTER BYPASS for development
            if (otp === '123456' || phone === '9999999999') {
                console.warn('Bypassing OTP verification for development...');

                // Check if user already exists in our table
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('phone', phone)
                    .single();

                if (existingUser) {
                    setUser(existingUser);
                    setRoleState(existingUser.role);
                } else {
                    // Start new mock session
                    setUser(null);
                }
                return;
            }

            const { data, error } = await supabase.auth.verifyOtp({
                phone: `+91${phone}`,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;

            if (data.user) {
                await fetchUserProfile(data.user.id);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const setRole = async (newRole: UserRole) => {
        setRoleState(newRole);
        if (user) {
            setUser({ ...user, role: newRole });
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ role: newRole })
                    .eq('id', user.id);
                if (error) throw error;
            } catch (error) {
                console.error('Error updating role in DB:', error);
            }
        }
    };

    const setListingCategory = async (category: ListingCategory) => {
        setListingCategoryState(category);
        if (user) {
            setUser({ ...user, listingCategory: category });
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ listing_category: category })
                    .eq('id', user.id);
                if (error) throw error;
            } catch (error) {
                console.error('Error updating listing category in DB:', error);
            }
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error('No user logged in');

            const { error } = await supabase
                .from('users')
                .update({
                    name: updates.name,
                    area: updates.area,
                    photo_url: updates.photoUrl,
                    email: updates.email,
                    availability: updates.availability,
                })
                .eq('id', user.id);

            if (error) throw error;
            setUser({ ...user, ...updates });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        } finally {
            setIsLoading(false);
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

            // Save to Supabase (User table)
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: authUser.id,
                    name: profile.name,
                    phone: profile.phone || phone,
                    role: profile.role || role,
                    listing_category: profile.listingCategory || listingCategory,
                    area: profile.area || 'Phase 1',
                    created_at: new Date().toISOString()
                });

            if (userError) throw userError;

            // Handle Worker Sub-profiles
            const p: any = profile;
            if (p.role === 'worker') {
                if (p.workerType === 'service') {
                    await supabase.from('service_providers').upsert({
                        user_id: authUser.id,
                        name: p.name,
                        phone: profile.phone || phone,
                        category: p.serviceCategory,
                        experience: p.experience,
                        skills: p.skills,
                        price_range: p.priceRange,
                        areas: [p.area],
                        availability: 'Available'
                    });
                } else if (p.workerType === 'job_seeker') {
                    await supabase.from('job_seeker_profiles').upsert({
                        user_id: authUser.id,
                        name: p.name,
                        phone: profile.phone || phone,
                        category: p.jobCategory,
                        skills: p.skills,
                        experience: p.experience,
                        expected_salary: p.expectedSalary,
                        area: p.area,
                        availability: 'Immediately'
                    });
                }
            }

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
            loginWithEmail,
            verifyOtp,
            completeProfile,
            updateProfile,
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
