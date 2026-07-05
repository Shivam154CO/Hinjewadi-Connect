import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { UserProfile, UserRole, ListingCategory } from '../types';
import { supabase } from '../supabase/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    role: UserRole;
    listingCategory: ListingCategory;
    isLoading: boolean;
    isProcessing: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    completeProfile: (profile: Partial<UserProfile>) => Promise<void>;
    updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
    setRole: (role: UserRole) => Promise<void>;
    setListingCategory: (category: ListingCategory) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRoleState] = useState<UserRole>(null);
    const [listingCategory, setListingCategoryState] = useState<ListingCategory>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Initialize session and listen for changes
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setUser(null);
                setRoleState(null);
                setListingCategoryState(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        if (!userId) {
            return;
        }
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // If profile row is missing from users table, auto-create a stub profile
                if (error.code === 'PGRST116') {
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    if (authUser) {
                        const { data: newProfile, error: insertError } = await supabase
                            .from('users')
                            .insert({
                                id: userId,
                                name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                                email: authUser.email,
                                role: 'tenant',
                                listing_category: 'property',
                                area: 'Phase 1',
                            })
                            .select()
                            .single();

                        if (!insertError && newProfile) {
                            const formattedUser: UserProfile = {
                                id: newProfile.id,
                                name: newProfile.name,
                                phone: newProfile.phone,
                                role: newProfile.role,
                                listingCategory: newProfile.listing_category,
                                area: newProfile.area,
                                photoUrl: newProfile.photo_url,
                                email: newProfile.email,
                                availability: newProfile.availability,
                            };
                            setUser(formattedUser);
                            setRoleState(newProfile.role);
                            setListingCategoryState(newProfile.listing_category);
                            return;
                        } else {
                            console.error('Failed to auto-create user profile row:', insertError);
                        }
                    }
                }
                throw error;
            }

            if (data) {
                const formattedUser: UserProfile = {
                    id: data.id,
                    name: data.name,
                    phone: data.phone,
                    role: data.role,
                    listingCategory: data.listing_category,
                    area: data.area,
                    photoUrl: data.photo_url,
                    email: data.email,
                    availability: data.availability,
                };
                setUser(formattedUser);
                setRoleState(data.role);
                setListingCategoryState(data.listing_category);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        setIsProcessing(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        setIsProcessing(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name }
                }
            });
            if (error) throw error;
            
            // Note: Profile creation is handled in completeProfile or via DB trigger
        } finally {
            setIsProcessing(false);
        }
    };

    const completeProfile = async (profile: Partial<UserProfile>) => {
        setIsProcessing(true);

        try {
            if (!session?.user) throw new Error('Not authenticated');

            const userId = session.user.id;
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: userId,
                    name: profile.name || session.user.user_metadata?.full_name,
                    phone: (profile.phone && profile.phone.trim()) ? profile.phone.trim() : null,
                    role: profile.role || role || 'tenant',
                    listing_category: profile.listingCategory || listingCategory || null,
                    area: profile.area || 'Phase 1',
                    email: session.user.email,
                    updated_at: new Date().toISOString()
                });

            if (userError) throw userError;

            // Handle Worker Sub-profiles (same as before but using userId)
            const p: any = profile;
            if ((profile.role || role) === 'worker') {
                if (p.workerType === 'service') {
                    await supabase.from('service_providers').upsert({
                        user_id: userId,
                        name: p.name || profile.name,
                        category: p.serviceCategory,
                        experience: p.experience,
                        skills: p.skills,
                        price_range: p.priceRange,
                        areas: [p.area || 'Phase 1'],
                        availability: 'Available'
                    });
                } else if (p.workerType === 'job_seeker') {
                    await supabase.from('job_seeker_profiles').upsert({
                        user_id: userId,
                        name: p.name || profile.name,
                        category: p.jobCategory,
                        skills: p.skills,
                        experience: p.experience,
                        expected_salary: p.expectedSalary,
                        area: p.area || 'Phase 1',
                        availability: 'Immediately'
                    });
                }
            }

            await fetchUserProfile(userId);
            const token = await notificationService.registerForPushNotificationsAsync();
            if (token) {
                await supabase.from('users').update({ push_token: token }).eq('id', userId);
            }
        } catch (error: any) {
            console.error('Error completing profile:', error);
            throw error;
        } finally {
            setIsProcessing(false);
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
        setIsProcessing(true);
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
            setIsProcessing(false);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            listingCategory,
            isLoading,
            isProcessing,
            signIn,
            signUp,
            completeProfile,
            updateProfile,
            setRole,
            setListingCategory,
            logout
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
