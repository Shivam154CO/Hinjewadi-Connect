import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps, UserRole, ListingCategory } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface RoleCardProps {
    title: string;
    description: string;
    icon: string;
    role: UserRole;
    onSelect: (role: UserRole) => void;
    color: string;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, description, icon, role, onSelect, color }) => (
    <TouchableOpacity
        style={[styles.card, SHADOWS.soft]}
        onPress={() => onSelect(role)}
        activeOpacity={0.7}
    >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon as any} size={30} color={color} />
        </View>
        <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.border} />
    </TouchableOpacity>
);

interface ListingCategoryCardProps {
    title: string;
    description: string;
    icon: string;
    category: ListingCategory;
    onSelect: (category: ListingCategory) => void;
    color: string;
}

const ListingCategoryCard: React.FC<ListingCategoryCardProps> = ({
    title, description, icon, category, onSelect, color
}) => (
    <TouchableOpacity
        style={[styles.categoryCard, SHADOWS.soft]}
        onPress={() => onSelect(category)}
        activeOpacity={0.7}
    >
        <View style={[styles.categoryIconContainer, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon as any} size={28} color={color} />
        </View>
        <View style={styles.categoryCardText}>
            <Text style={styles.categoryCardTitle}>{title}</Text>
            <Text style={styles.categoryCardDescription}>{description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
);

export const RoleSelectionScreen: React.FC<AuthScreenProps<'RoleSelection'>> = ({ navigation }) => {
    const { t } = useTranslation();
    const { setRole, setListingCategory } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [workerType, setWorkerType] = useState<'service' | 'job_seeker' | null>(null);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);

        // For employer role, we need to show category selection first
        if (role === 'employer') {
            return;
        }

        // For worker, we need to show worker type selection
        if (role === 'worker') {
            return;
        }

        // For tenant, set role and navigate
        setRole(role);
        setListingCategory(null);
        navigation.navigate('ProfileCreation', { role });
    };

    const handleWorkerTypeSelect = (type: 'service' | 'job_seeker') => {
        setWorkerType(type);
        setRole('worker');
        navigation.navigate('ProfileCreation', { role: 'worker', workerType: type });
    };

    const handleCategorySelect = (category: ListingCategory) => {
        if (selectedRole) {
            setRole(selectedRole);
            setListingCategory(category);
            navigation.navigate('ProfileCreation', { role: selectedRole, listingCategory: category });
        }
    };

    const handleBack = () => {
        setSelectedRole(null);
        setWorkerType(null);
    };

    // Show listing category selection for employer role
    if (selectedRole === 'employer') {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.title}>What do you want to list?</Text>
                        <Text style={styles.subtitle}>Select the type of listing you want to post</Text>
                    </View>

                    <View style={styles.list}>
                        <ListingCategoryCard
                            title="List Property"
                            description="Post rooms, PG, or flats for rent."
                            icon="home-city"
                            category="property"
                            onSelect={handleCategorySelect}
                            color={COLORS.primary}
                        />

                        <ListingCategoryCard
                            title="Post Jobs"
                            description="Hire workers for your society or office."
                            icon="briefcase-plus"
                            category="job"
                            onSelect={handleCategorySelect}
                            color={COLORS.success}
                        />

                        <ListingCategoryCard
                            title="Both"
                            description="List property and post jobs."
                            icon="format-list-bulleted"
                            category="both"
                            onSelect={handleCategorySelect}
                            color={COLORS.secondary}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            You can always switch your role later in settings
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Show worker type selection view
    if (selectedRole === 'worker') {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.title}>What kind of work?</Text>
                        <Text style={styles.subtitle}>Tell us how you want to be discovered</Text>
                    </View>

                    <View style={styles.list}>
                        <ListingCategoryCard
                            title="Individual Service"
                            description="Maid, Cook, Cleaner, Driver, etc."
                            icon="account-wrench-outline"
                            category={'service' as any}
                            onSelect={() => handleWorkerTypeSelect('service')}
                            color={COLORS.success}
                        />

                        <ListingCategoryCard
                            title="Looking for Job"
                            description="Security, Office Boy, Guard, Helper, etc."
                            icon="account-search-outline"
                            category={'job_seeker' as any}
                            onSelect={() => handleWorkerTypeSelect('job_seeker')}
                            color={COLORS.primary}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Default role selection view
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('role_selection_title')}</Text>
                    <Text style={styles.subtitle}>{t('role_selection_subtitle')}</Text>
                </View>

                <View style={styles.list}>
                    <RoleCard
                        title={t('room_finder')}
                        description="Find the best rooms and PGs in Phase 1, 2, or 3."
                        icon="home-search"
                        role="tenant"
                        onSelect={handleRoleSelect}
                        color={COLORS.primary}
                    />

                    <RoleCard
                        title={t('worker')}
                        description="Find local jobs as a maid, cook, driver, or helper."
                        icon="briefcase-search"
                        role="worker"
                        onSelect={handleRoleSelect}
                        color={COLORS.success}
                    />

                    <RoleCard
                        title={t('owner')}
                        description="Post jobs or list your room/PG for others."
                        icon="account-hard-hat"
                        role="employer"
                        onSelect={handleRoleSelect}
                        color={COLORS.secondary}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        You can always switch your role later in settings
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.xl,
        flexGrow: 1,
    },
    header: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.title,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.subHeading,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    backButton: {
        marginBottom: SPACING.lg,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.border,
        ...SHADOWS.soft,
    },
    list: {
        gap: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        borderWidth: 1.5,
        borderColor: COLORS.surface,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.text,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    categoryCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        borderWidth: 1.5,
        borderColor: COLORS.surface,
    },
    categoryIconContainer: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    categoryCardText: {
        flex: 1,
    },
    categoryCardTitle: {
        fontSize: 17,
        fontFamily: FONTS.heading,
        color: COLORS.text,
        marginBottom: 4,
    },
    categoryCardDescription: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: SPACING.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
