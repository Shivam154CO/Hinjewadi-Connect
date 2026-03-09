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
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Job Seeker Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Banner */}
                    <View style={styles.banner}>
                        <View style={styles.bannerIcon}>
                            <MaterialCommunityIcons name="briefcase-plus" size={28} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitle}>Create Your Job Profile</Text>
                            <Text style={styles.bannerSubtext}>Let employers in Hinjewadi find and hire you</Text>
                        </View>
                    </View>

                    {/* Name */}
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        placeholderTextColor={COLORS.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Phone */}
                    <Text style={styles.label}>Phone Number *</Text>
                    <View style={styles.phoneInputRow}>
                        <View style={styles.phonePrefix}>
                            <Text style={styles.phonePrefixText}>+91</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                            placeholder="Enter your phone number"
                            placeholderTextColor={COLORS.textSecondary}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>

                    {/* Category */}
                    <Text style={styles.label}>Job Category *</Text>
                    <Text style={styles.helperText}>What type of job are you looking for?</Text>
                    <View style={styles.categoryGrid}>
                        {JOB_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.key}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory === cat.key && styles.categoryCardActive
                                ]}
                                onPress={() => {
                                    setSelectedCategory(cat.key);
                                    setSelectedSkills([]);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={cat.icon as any}
                                    size={22}
                                    color={selectedCategory === cat.key ? COLORS.white : COLORS.primary}
                                />
                                <Text style={[
                                    styles.categoryCardText,
                                    selectedCategory === cat.key && styles.categoryCardTextActive
                                ]}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Skills */}
                    {availableSkills.length > 0 && (
                        <>
                            <Text style={styles.label}>Your Skills</Text>
                            <Text style={styles.helperText}>Select all that apply</Text>
                            <View style={styles.chipsRow}>
                                {availableSkills.map(skill => (
                                    <TouchableOpacity
                                        key={skill}
                                        style={[
                                            styles.skillChip,
                                            selectedSkills.includes(skill) && styles.skillChipActive
                                        ]}
                                        onPress={() => toggleSkill(skill)}
                                    >
                                        <MaterialCommunityIcons
                                            name={selectedSkills.includes(skill) ? 'check-circle' : 'circle-outline'}
                                            size={16}
                                            color={selectedSkills.includes(skill) ? COLORS.primary : COLORS.textSecondary}
                                        />
                                        <Text style={[
                                            styles.skillChipText,
                                            selectedSkills.includes(skill) && styles.skillChipTextActive
                                        ]}>{skill}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Experience */}
                    <Text style={styles.label}>Experience</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 3 years as security guard"
                        placeholderTextColor={COLORS.textSecondary}
                        value={experience}
                        onChangeText={setExperience}
                    />

                    {/* Expected Salary */}
                    <Text style={styles.label}>Expected Salary</Text>
                    <View style={styles.salaryInputRow}>
                        <View style={styles.salaryPrefix}>
                            <Text style={styles.salaryPrefixText}>₹</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                            placeholder="e.g., 15000"
                            placeholderTextColor={COLORS.textSecondary}
                            value={expectedSalary}
                            onChangeText={setExpectedSalary}
                            keyboardType="numeric"
                        />
                        <View style={styles.salarySuffix}>
                            <Text style={styles.salarySuffixText}>/month</Text>
                        </View>
                    </View>

                    {/* Preferred Area */}
                    <Text style={styles.label}>Preferred Area *</Text>
                    <View style={styles.chipsRow}>
                        {AREAS.map(area => (
                            <TouchableOpacity
                                key={area}
                                style={[
                                    styles.areaChip,
                                    selectedArea === area && styles.areaChipActive
                                ]}
                                onPress={() => setSelectedArea(area)}
                            >
                                <MaterialCommunityIcons
                                    name="map-marker"
                                    size={16}
                                    color={selectedArea === area ? COLORS.white : COLORS.textSecondary}
                                />
                                <Text style={[
                                    styles.areaChipText,
                                    selectedArea === area && styles.areaChipTextActive
                                ]}>{area}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Availability */}
                    <Text style={styles.label}>Availability</Text>
                    <View style={styles.chipsRow}>
                        {AVAILABILITY_OPTIONS.map(option => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.availChip,
                                    availability === option && styles.availChipActive
                                ]}
                                onPress={() => setAvailability(option)}
                            >
                                <MaterialCommunityIcons
                                    name={availability === option ? 'radiobox-marked' : 'radiobox-blank'}
                                    size={16}
                                    color={availability === option ? COLORS.white : COLORS.textSecondary}
                                />
                                <Text style={[
                                    styles.availChipText,
                                    availability === option && styles.availChipTextActive
                                ]}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Description */}
                    <Text style={styles.label}>About Yourself</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell employers about yourself — your strengths, why they should hire you..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.white} />
                                <Text style={styles.submitButtonText}>Create Job Profile</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Tip */}
                    <View style={styles.tipCard}>
                        <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FF9800" />
                        <Text style={styles.tipText}>
                            Tip: Profiles with complete information get 3x more calls from employers!
                        </Text>
                    </View>

                    <View style={{ height: SPACING.xl }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.light,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    content: {
        paddingHorizontal: SPACING.lg,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F0FF',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    bannerIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
    bannerSubtext: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
        marginTop: SPACING.md,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: 14,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    phoneInputRow: {
        flexDirection: 'row',
    },
    phonePrefix: {
        backgroundColor: '#EEF2F6',
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: BORDER_RADIUS.md,
        borderBottomLeftRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderRightWidth: 0,
        borderColor: COLORS.border,
    },
    phonePrefixText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    salaryInputRow: {
        flexDirection: 'row',
    },
    salaryPrefix: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: BORDER_RADIUS.md,
        borderBottomLeftRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderRightWidth: 0,
        borderColor: COLORS.border,
    },
    salaryPrefixText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.success,
    },
    salarySuffix: {
        backgroundColor: '#EEF2F6',
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: BORDER_RADIUS.md,
        borderBottomRightRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: COLORS.border,
    },
    salarySuffixText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    categoryCard: {
        width: '23%',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 4,
    },
    categoryCardActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryCardText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    categoryCardTextActive: {
        color: COLORS.white,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    skillChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 6,
    },
    skillChipActive: {
        backgroundColor: '#E3F0FF',
        borderColor: COLORS.primary,
    },
    skillChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    skillChipTextActive: {
        color: COLORS.primary,
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 6,
    },
    areaChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    areaChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    areaChipTextActive: {
        color: COLORS.white,
    },
    availChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 6,
    },
    availChipActive: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    availChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    availChipTextActive: {
        color: COLORS.white,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.full,
        marginTop: SPACING.xl,
        gap: 8,
        ...SHADOWS.medium,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    tipText: {
        flex: 1,
        fontSize: 12,
        color: '#E65100',
        lineHeight: 18,
    },
});
