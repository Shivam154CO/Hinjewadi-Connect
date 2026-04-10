import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile, UserRole, ListingCategory } from '../types';
import { supabase } from '../supabase/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';

interface AuthContextType {
    user: UserProfile | null;
    role: UserRole;
    listingCategory: ListingCategory;
    isLoading: boolean;
    isProcessing: boolean;
    login: (name: string) => Promise<boolean>;
    completeProfile: (profile: Partial<UserProfile>) => Promise<void>;
    updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
    setRole: (role: UserRole) => Promise<void>;
    setListingCategory: (category: ListingCategory) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [role, setRoleState] = useState<UserRole>(null);
    const [listingCategory, setListingCategoryState] = useState<ListingCategory>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [name, setName] = useState<string>('');

    const captureAndSavePushToken = async (userId: string) => {
        const token = await notificationService.registerForPushNotificationsAsync();
        if (token) {
            await supabase.from('users').update({ push_token: token }).eq('id', userId);
        }
    };

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('user_id');
                if (storedUserId) {
                    await fetchUserProfile(storedUserId);
                }
            } catch (e) {
                console.error('Failed to load local session', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
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
            // If user doesn't exist anymore in DB, clear local storage
            await AsyncStorage.removeItem('user_id');
        }
    };

    const login = async (inputName: string): Promise<boolean> => {
        setIsProcessing(true);
        setName(inputName);
        try {
            // Check if user exists with this name in the database
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('name', inputName.trim())
                .limit(1)
                .maybeSingle();

            if (data) {
                // User exists, fetch profile and set state
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
                
                // Store locally for autologin
                await AsyncStorage.setItem('user_id', data.id);
                captureAndSavePushToken(data.id);
                return true; // Already registered
            } else {
                // User doesn't exist
                setUser(null);
                return false; // New registration
            }
        } catch (error: any) {
            console.error('Simple Login Error:', error);
            setUser(null);
            return false;
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

    const completeProfile = async (profile: Partial<UserProfile>) => {
        setIsProcessing(true);
        try {
            const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
            const userProfile: UserProfile = {
                id: newId,
                name: profile.name || name,
                role: role,
                listingCategory: listingCategory,
                area: profile.area || 'Phase 1',
                ...profile
            };

            // Save to Supabase (User table)
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: newId,
                    name: profile.name || name,
                    role: profile.role || role || 'tenant',
                    listing_category: profile.listingCategory || listingCategory || null,
                    area: profile.area || 'Phase 1',
                    created_at: new Date().toISOString()
                });

            if (userError) throw userError;

            // Handle Worker Sub-profiles
            const p: any = profile;
            if ((profile.role || role) === 'worker') {
                if (p.workerType === 'service') {
                    await supabase.from('service_providers').upsert({
                        user_id: newId,
                        name: p.name || name,
                        category: p.serviceCategory,
                        experience: p.experience,
                        skills: p.skills,
                        price_range: p.priceRange,
                        areas: [p.area || 'Phase 1'],
                        availability: 'Available'
                    });
                } else if (p.workerType === 'job_seeker') {
                    await supabase.from('job_seeker_profiles').upsert({
                        user_id: newId,
                        name: p.name || name,
                        category: p.jobCategory,
                        skills: p.skills,
                        experience: p.experience,
                        expected_salary: p.expectedSalary,
                        area: p.area || 'Phase 1',
                        availability: 'Immediately'
                    });
                }
            }

            setUser(userProfile);
            await AsyncStorage.setItem('user_id', newId);
            captureAndSavePushToken(newId);
        } catch (error: any) {
            console.error('Error creating profile DETAILS:', error?.message || error || 'Unknown Error');
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user_id');
        } catch (error) {
            console.error('Error logging out:', error);
        }
        setUser(null);
        setRoleState(null);
        setListingCategoryState(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            role,
            listingCategory,
            isLoading,
            isProcessing,
            login,
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
