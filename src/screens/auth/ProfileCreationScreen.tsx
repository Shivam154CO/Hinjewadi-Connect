import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps, ListingCategory } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AREAS = ['Phase 1', 'Phase 2', 'Phase 3'];

// Helper to get display text for listing category
const getListingCategoryText = (category: ListingCategory): string => {
    switch (category) {
        case 'property':
            return 'Property Listings';
        case 'job':
            return 'Job Postings';
        case 'both':
            return 'Property & Job Listings';
        default:
            return '';
    }
};

// Helper to get icon for listing category
const getListingCategoryIcon = (category: ListingCategory): string => {
    switch (category) {
        case 'property':
            return 'home-city';
        case 'job':
            return 'briefcase-plus';
        case 'both':
            return 'format-list-bulleted';
        default:
            return 'checkbox-blank-circle';
    }
};

export const ProfileCreationScreen: React.FC<AuthScreenProps<'ProfileCreation'>> = ({ route, navigation }) => {
    const { role, listingCategory } = route.params;
    const [name, setName] = useState('');
    const [selectedArea, setSelectedArea] = useState('Phase 1');
    const { completeProfile, isLoading } = useAuth();

    const handleComplete = async () => {
        if (name.trim()) {
            await completeProfile({
                name,
                area: selectedArea,
                role: role,
                listingCategory: listingCategory || null
            });
            // Navigation to home will be handled by Auth state change
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete your profile</Text>
                        <Text style={styles.subtitle}>Help others discover you in Hinjewadi</Text>
                    </View>

                    {/* Show listing category for employer role */}
                    {role === 'employer' && listingCategory && (
                        <View style={styles.categoryBanner}>
                            <View style={styles.categoryBannerIcon}>
                                <MaterialCommunityIcons 
                                    name={getListingCategoryIcon(listingCategory) as any} 
                                    size={24} 
                                    color={COLORS.secondary} 
                                />
                            </View>
                            <View style={styles.categoryBannerText}>
                                <Text style={styles.categoryBannerLabel}>You're registering as:</Text>
                                <Text style={styles.categoryBannerValue}>
                                    {getListingCategoryText(listingCategory)}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.photoContainer}>
                        <TouchableOpacity style={styles.photoPlaceholder}>
                            <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.textSecondary} />
                            <Text style={styles.photoText}>Add Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <AppTextInput
                            label="Full Name"
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>Primary Working/Living Area</Text>
                        <View style={styles.areaContainer}>
                            {AREAS.map(area => (
                                <TouchableOpacity
                                    key={area}
                                    style={[
                                        styles.areaButton,
                                        selectedArea === area && styles.areaButtonActive
                                    ]}
                                    onPress={() => setSelectedArea(area)}
                                >
                                    <Text style={[
                                        styles.areaButtonText,
                                        selectedArea === area && styles.areaButtonTextActive
                                    ]}>
                                        {area}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <PrimaryButton
                            title="Finish Setup"
                            onPress={handleComplete}
                            loading={isLoading}
                            style={styles.completeButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.lg,
        flexGrow: 1,
    },
    header: {
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    categoryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary + '15',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.secondary + '30',
    },
    categoryBannerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.secondary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    categoryBannerText: {
        flex: 1,
    },
    categoryBannerLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    categoryBannerValue: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    form: {
        marginTop: SPACING.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    areaContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.xxl,
    },
    areaButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    areaButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    areaButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    areaButtonTextActive: {
        color: COLORS.white,
    },
    completeButton: {
        marginTop: SPACING.lg,
    },
});
