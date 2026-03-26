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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../theme/theme';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps, ListingCategory, ServiceCategory, JobCategory } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

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

const SERVICE_CATEGORIES: ServiceCategory[] = ['Maid', 'Cook', 'Cleaner', 'Laundry', 'Driver'];
const JOB_CATEGORIES: JobCategory[] = ['Peon', 'Guard', 'Office Boy', 'Watchman', 'Helper', 'Security', 'Driver', 'Cook'];

export const ProfileCreationScreen: React.FC<AuthScreenProps<'ProfileCreation'>> = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { role, listingCategory, workerType } = route.params;
    const [name, setName] = useState('');
    const [selectedArea, setSelectedArea] = useState('Phase 1');

    // Worker Specific State
    const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Maid');
    const [jobCategory, setJobCategory] = useState<JobCategory>('Security');
    const [experience, setExperience] = useState('');
    const [salary, setSalary] = useState('');
    const [skills, setSkills] = useState('');

    const { completeProfile, isProcessing } = useAuth();

    const handleComplete = async () => {
        if (!name.trim()) return;

        const profileData: any = {
            name,
            area: selectedArea,
            role,
            listingCategory: listingCategory || null,
        };

        if (role === 'worker') {
            profileData.workerType = workerType;
            if (workerType === 'service') {
                profileData.serviceCategory = serviceCategory;
                profileData.experience = experience;
                profileData.skills = skills.split(',').map(s => s.trim()).filter(s => s);
                profileData.priceRange = salary;
            } else if (workerType === 'job_seeker') {
                profileData.jobCategory = jobCategory;
                profileData.experience = experience;
                profileData.skills = skills.split(',').map(s => s.trim()).filter(s => s);
                profileData.expectedSalary = salary;
            }
        }

        await completeProfile(profileData);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('profile_creation_title')}</Text>
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
                            label={t('name')}
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={setName}
                        />

                        {role === 'worker' && workerType === 'service' && (
                            <>
                                <Text style={styles.label}>What service do you provide?</Text>
                                <View style={styles.chipContainer}>
                                    {SERVICE_CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.chip, serviceCategory === cat && styles.chipActive]}
                                            onPress={() => setServiceCategory(cat)}
                                        >
                                            <Text style={[styles.chipText, serviceCategory === cat && styles.chipTextActive]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <AppTextInput
                                    label="Experience (e.g. 5 Years)"
                                    placeholder="How long have you been working?"
                                    value={experience}
                                    onChangeText={setExperience}
                                />
                                <AppTextInput
                                    label="Skills (comma separated)"
                                    placeholder="Cleaning, Cooking, Ironing..."
                                    value={skills}
                                    onChangeText={setSkills}
                                />
                                <AppTextInput
                                    label="Expected Price / Monthly Charge"
                                    placeholder="₹3,000 - ₹5,000"
                                    value={salary}
                                    onChangeText={setSalary}
                                />
                            </>
                        )}

                        {role === 'worker' && workerType === 'job_seeker' && (
                            <>
                                <Text style={styles.label}>What job are you looking for?</Text>
                                <View style={styles.chipContainer}>
                                    {JOB_CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.chip, jobCategory === cat && styles.chipActive]}
                                            onPress={() => setJobCategory(cat)}
                                        >
                                            <Text style={[styles.chipText, jobCategory === cat && styles.chipTextActive]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <AppTextInput
                                    label="Your Experience"
                                    placeholder="e.g. 2 years as Security"
                                    value={experience}
                                    onChangeText={setExperience}
                                />
                                <AppTextInput
                                    label="Education / Skills"
                                    placeholder="10th Pass, Guard Training..."
                                    value={skills}
                                    onChangeText={setSkills}
                                />
                                <AppTextInput
                                    label="Expected Monthly Salary"
                                    placeholder="₹15,000"
                                    value={salary}
                                    onChangeText={setSalary}
                                />
                            </>
                        )}

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
                            title={t('save')}
                            onPress={handleComplete}
                            loading={isProcessing}
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
        padding: SPACING.xl,
        flexGrow: 1,
    },
    header: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: SPACING.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    categoryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.soft,
    },
    categoryBannerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary + '10',
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
        fontFamily: FONTS.bold,
    },
    categoryBannerValue: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.primary,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 6,
        fontFamily: FONTS.bold,
    },
    form: {
        marginTop: SPACING.sm,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
        marginTop: SPACING.lg,
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
        ...SHADOWS.soft,
    },
    areaButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    areaButtonTextActive: {
        color: COLORS.white,
    },
    completeButton: {
        marginTop: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: SPACING.md,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.soft,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    chipTextActive: {
        color: COLORS.white,
    }
});
