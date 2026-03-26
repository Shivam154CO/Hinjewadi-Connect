import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainStackScreenProps, JobCategory, JobSeekerProfile } from '../../types';
import { jobService } from '../../services/jobService';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';

const JOB_CATEGORIES: { key: JobCategory; label: string; icon: string }[] = [
    { key: 'Peon', label: 'Peon', icon: 'account' },
    { key: 'Guard', label: 'Guard', icon: 'shield-account' },
    { key: 'Office Boy', label: 'Office Boy', icon: 'briefcase-outline' },
    { key: 'Watchman', label: 'Watchman', icon: 'eye-outline' },
    { key: 'Helper', label: 'Helper', icon: 'hand-heart' },
    { key: 'Security', label: 'Security', icon: 'security' },
    { key: 'Driver', label: 'Driver', icon: 'car' },
    { key: 'Cook', label: 'Cook', icon: 'chef-hat' },
];

const AREAS = ['Phase 1', 'Phase 2', 'Phase 3'];

const SKILLS_BY_CATEGORY: Record<JobCategory, string[]> = {
    Peon: ['Document delivery', 'Tea/Coffee service', 'Office cleaning', 'Filing', 'Photocopy'],
    Guard: ['Gate management', 'CCTV monitoring', 'Visitor log', 'Night patrol', 'Emergency response'],
    'Office Boy': ['Pantry management', 'Courier handling', 'Housekeeping', 'Setup meetings', 'Errands'],
    Watchman: ['Night watch', 'Society patrol', 'Visitor screening', 'Key management', 'Incident reporting'],
    Helper: ['Kitchen help', 'Loading/Unloading', 'Cleaning', 'Errand running', 'Setup/Teardown'],
    Security: ['Access control', 'Fire safety', 'First aid', 'Emergency drills', 'Surveillance'],
    Driver: ['City driving', 'Highway driving', 'Vehicle maintenance', 'Route knowledge', 'GPS navigation'],
    Cook: ['Indian cuisine', 'South Indian', 'Chinese', 'Continental', 'Baking', 'Meal planning'],
};

const AVAILABILITY_OPTIONS = ['Immediately', 'Within 1 Week', 'Within 1 Month'] as const;

export const CreateJobProfileScreen: React.FC<MainStackScreenProps<'CreateJobProfile'>> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [experience, setExperience] = useState('');
    const [expectedSalary, setExpectedSalary] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [availability, setAvailability] = useState<typeof AVAILABILITY_OPTIONS[number]>('Immediately');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim() || !selectedCategory || !selectedArea) {
            Alert.alert('Incomplete', 'Please fill in all required fields (Name, Phone, Category, Area).');
            return;
        }

        setLoading(true);
        try {
            const profile: Omit<JobSeekerProfile, 'id' | 'createdAt'> = {
                name,
                phone,
                category: selectedCategory,
                skills: selectedSkills,
                experience,
                expectedSalary,
                area: selectedArea,
                availability,
                description,
            };

            await jobService.createJobSeekerProfile(profile);

            Alert.alert(
                'Profile Created! 🎉',
                'Your job seeker profile is now live. Employers can find and contact you.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error creating job seeker profile:', error);
            Alert.alert('Error', 'Failed to create profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const availableSkills = selectedCategory ? SKILLS_BY_CATEGORY[selectedCategory] : [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Create Job Profile</Text>

                <AppTextInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                />

                <AppTextInput
                    label="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                />

                <Text style={styles.sectionTitle}>Job Category</Text>
                <View style={styles.categoryGrid}>
                    {JOB_CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.key}
                            style={[
                                styles.categoryCard,
                                selectedCategory === category.key && styles.categoryCardSelected
                            ]}
                            onPress={() => setSelectedCategory(category.key)}
                        >
                            <MaterialCommunityIcons
                                name={category.icon as any}
                                size={24}
                                color={selectedCategory === category.key ? COLORS.primary : COLORS.textSecondary}
                            />
                            <Text style={[
                                styles.categoryLabel,
                                selectedCategory === category.key && styles.categoryLabelSelected
                            ]}>
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Area</Text>
                <View style={styles.areaGrid}>
                    {AREAS.map((area) => (
                        <TouchableOpacity
                            key={area}
                            style={[
                                styles.areaChip,
                                selectedArea === area && styles.areaChipSelected
                            ]}
                            onPress={() => setSelectedArea(area)}
                        >
                            <Text style={[
                                styles.areaText,
                                selectedArea === area && styles.areaTextSelected
                            ]}>
                                {area}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <AppTextInput
                    label="Experience (years)"
                    value={experience}
                    onChangeText={setExperience}
                    placeholder="e.g., 2 years"
                    keyboardType="numeric"
                />

                <AppTextInput
                    label="Expected Salary (₹ per month)"
                    value={expectedSalary}
                    onChangeText={setExpectedSalary}
                    placeholder="e.g., 15000"
                    keyboardType="numeric"
                />

                {availableSkills.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsGrid}>
                            {availableSkills.map((skill) => (
                                <TouchableOpacity
                                    key={skill}
                                    style={[
                                        styles.skillChip,
                                        selectedSkills.includes(skill) && styles.skillChipSelected
                                    ]}
                                    onPress={() => toggleSkill(skill)}
                                >
                                    <Text style={[
                                        styles.skillText,
                                        selectedSkills.includes(skill) && styles.skillTextSelected
                                    ]}>
                                        {skill}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <Text style={styles.sectionTitle}>Availability</Text>
                <View style={styles.availabilityGrid}>
                    {AVAILABILITY_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.availabilityChip,
                                availability === option && styles.availabilityChipSelected
                            ]}
                            onPress={() => setAvailability(option)}
                        >
                            <Text style={[
                                styles.availabilityText,
                                availability === option && styles.availabilityTextSelected
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <AppTextInput
                    label="Description (Optional)"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Tell employers about yourself..."
                    multiline
                    numberOfLines={3}
                />

                <PrimaryButton
                    title={loading ? "Creating Profile..." : "Create Profile"}
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.submitButton}
                />
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
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    categoryCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    categoryCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.secondary,
    },
    categoryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    categoryLabelSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    areaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    areaChip: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    areaChipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.secondary,
    },
    areaText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    areaTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    skillChip: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    skillChipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.secondary,
    },
    skillText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    skillTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    availabilityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    availabilityChip: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    availabilityChipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.secondary,
    },
    availabilityText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    availabilityTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
});

export default CreateJobProfileScreen;
