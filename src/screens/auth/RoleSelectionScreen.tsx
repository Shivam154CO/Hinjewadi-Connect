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
import { LinearGradient } from 'expo-linear-gradient';

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
        style={[styles.card, SHADOWS.medium]}
        onPress={() => onSelect(role)}
        activeOpacity={0.8}
    >
        <LinearGradient
            colors={[color + '20', color + '05']}
            style={styles.iconContainer}
        >
            <MaterialCommunityIcons name={icon as any} size={32} color={color} />
        </LinearGradient>
        <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <View style={styles.chevron}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
        </View>
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
        style={[styles.categoryCard, SHADOWS.medium]}
        onPress={() => onSelect(category)}
        activeOpacity={0.8}
    >
        <LinearGradient
            colors={[color + '20', color + '05']}
            style={styles.categoryIconContainer}
        >
            <MaterialCommunityIcons name={icon as any} size={28} color={color} />
        </LinearGradient>
        <View style={styles.categoryCardText}>
            <Text style={styles.categoryCardTitle}>{title}</Text>
            <Text style={styles.categoryCardDescription}>{description}</Text>
        </View>
        <View style={styles.chevron}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
        </View>
    </TouchableOpacity>
);

export const RoleSelectionScreen: React.FC<AuthScreenProps<'RoleSelection'>> = ({ navigation }) => {
    const { t } = useTranslation();
    const { setRole, setListingCategory } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [workerType, setWorkerType] = useState<'service' | 'job_seeker' | null>(null);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);

        if (role === 'employer') return;
        if (role === 'worker') return;

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

    const renderHeader = (title: string, subtitle: string, showBack = false) => (
        <View style={styles.header}>
            {showBack && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.secondary + '08', 'transparent']}
                style={styles.blob1}
            />
            <LinearGradient
                colors={['transparent', COLORS.primary + '05']}
                style={styles.blob2}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!selectedRole ? (
                    <>
                        {renderHeader(t('role_selection_title'), t('role_selection_subtitle'))}
                        <View style={styles.list}>
                            <RoleCard
                                title={t('room_finder')}
                                description="Find the best rooms and PGs in Hinjewadi."
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
                    </>
                ) : selectedRole === 'employer' ? (
                    <>
                        {renderHeader("What do you want to list?", "Select the type of listing you want to post", true)}
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
                    </>
                ) : (
                    <>
                        {renderHeader("What kind of work?", "Tell us how you want to be discovered", true)}
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
                    </>
                )}

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
    blob1: {
        position: 'absolute',
        top: -50,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        zIndex: 0,
    },
    blob2: {
        position: 'absolute',
        top: 200,
        right: -80,
        width: 250,
        height: 250,
        borderRadius: 125,
        zIndex: 0,
    },
    scrollContent: {
        padding: SPACING.xl,
        paddingTop: SPACING.lg,
        flexGrow: 1,
        zIndex: 1,
    },
    header: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 34,
        fontFamily: FONTS.title,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        letterSpacing: -1.5,
        fontWeight: '900',
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
        backgroundColor: COLORS.surface,
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
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 19,
        fontFamily: FONTS.heading,
        color: COLORS.text,
        marginBottom: 2,
        fontWeight: '700',
    },
    cardDescription: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    chevron: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    categoryIconContainer: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    categoryCardText: {
        flex: 1,
    },
    categoryCardTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.text,
        marginBottom: 2,
        fontWeight: '700',
    },
    categoryCardDescription: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: SPACING.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: COLORS.textMuted,
        fontStyle: 'italic',
    },
});
