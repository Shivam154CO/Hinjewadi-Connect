import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainStackScreenProps, ServiceCategory } from '../../types';

const SERVICE_CATEGORIES: { key: ServiceCategory; label: string; icon: string }[] = [
    { key: 'Maid', label: 'Maid', icon: 'broom' },
    { key: 'Cook', label: 'Cook', icon: 'chef-hat' },
    { key: 'Cleaner', label: 'Cleaner', icon: 'spray' },
    { key: 'Laundry', label: 'Laundry', icon: 'tshirt-crew' },
    { key: 'Driver', label: 'Driver', icon: 'car' },
];

const AREAS = ['Phase 1', 'Phase 2', 'Phase 3'];

const SKILLS_BY_CATEGORY: Record<ServiceCategory, string[]> = {
    Maid: ['Cleaning', 'Utensils', 'Mopping', 'Dusting', 'Cooking Basics', 'Laundry', 'Childcare'],
    Cook: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Baking', 'Salads', 'Diet Food'],
    Cleaner: ['Deep Clean', 'Office', 'Bathroom', 'Kitchen', 'Carpet', 'Window', 'Society Areas'],
    Laundry: ['Washing', 'Ironing', 'Dry Clean', 'Steam Press', 'Pickup/Drop'],
    Driver: ['City', 'Highway', 'Outstation', 'Night Drive', 'Two Wheeler', 'Heavy Vehicle'],
};

export const CreateServiceProfileScreen: React.FC<MainStackScreenProps<'CreateServiceProfile'>> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
    const [experience, setExperience] = useState('');
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [workingHours, setWorkingHours] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [description, setDescription] = useState('');
    const [availability, setAvailability] = useState<'Available' | 'Busy' | 'Paused'>('Available');

    const toggleArea = (area: string) => {
        setSelectedAreas(prev =>
            prev.includes(area)
                ? prev.filter(a => a !== area)
                : [...prev, area]
        );
    };

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const handleSubmit = () => {
        if (!name.trim() || !phone.trim() || !selectedCategory || selectedAreas.length === 0) {
            Alert.alert('Incomplete', 'Please fill in all required fields.');
            return;
        }
        // In production: POST to API
        Alert.alert('Success!', 'Your service profile has been created. Customers can now find you!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
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
                    <Text style={styles.headerTitle}>Create Service Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Banner */}
                    <View style={styles.banner}>
                        <MaterialCommunityIcons name="account-plus" size={30} color={COLORS.secondary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitle}>Register as a Service Provider</Text>
                            <Text style={styles.bannerSubtext}>Fill in your details to start receiving customers</Text>
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
                    <TextInput
                        style={styles.input}
                        placeholder="Enter phone number"
                        placeholderTextColor={COLORS.textSecondary}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    {/* WhatsApp */}
                    <Text style={styles.label}>WhatsApp Number (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Same as phone if blank"
                        placeholderTextColor={COLORS.textSecondary}
                        value={whatsapp}
                        onChangeText={setWhatsapp}
                        keyboardType="phone-pad"
                    />

                    {/* Category Selection */}
                    <Text style={styles.label}>Service Category *</Text>
                    <View style={styles.categoryGrid}>
                        {SERVICE_CATEGORIES.map(cat => (
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
                                    size={24}
                                    color={selectedCategory === cat.key ? COLORS.white : COLORS.secondary}
                                />
                                <Text style={[
                                    styles.categoryCardText,
                                    selectedCategory === cat.key && styles.categoryCardTextActive
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Experience */}
                    <Text style={styles.label}>Experience</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 5 years"
                        placeholderTextColor={COLORS.textSecondary}
                        value={experience}
                        onChangeText={setExperience}
                    />

                    {/* Areas Served */}
                    <Text style={styles.label}>Areas Served *</Text>
                    <View style={styles.chipsRow}>
                        {AREAS.map(area => (
                            <TouchableOpacity
                                key={area}
                                style={[
                                    styles.areaChip,
                                    selectedAreas.includes(area) && styles.areaChipActive
                                ]}
                                onPress={() => toggleArea(area)}
                            >
                                <MaterialCommunityIcons
                                    name={selectedAreas.includes(area) ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                                    size={16}
                                    color={selectedAreas.includes(area) ? COLORS.white : COLORS.textSecondary}
                                />
                                <Text style={[
                                    styles.areaChipText,
                                    selectedAreas.includes(area) && styles.areaChipTextActive
                                ]}>
                                    {area}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Skills */}
                    {availableSkills.length > 0 && (
                        <>
                            <Text style={styles.label}>Skills & Specialties</Text>
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
                                        <Text style={[
                                            styles.skillChipText,
                                            selectedSkills.includes(skill) && styles.skillChipTextActive
                                        ]}>
                                            {skill}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Working Hours */}
                    <Text style={styles.label}>Working Hours</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 8 AM - 12 PM"
                        placeholderTextColor={COLORS.textSecondary}
                        value={workingHours}
                        onChangeText={setWorkingHours}
                    />

                    {/* Price Range */}
                    <Text style={styles.label}>Price Range</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., ₹3,000 - ₹5,000/mo"
                        placeholderTextColor={COLORS.textSecondary}
                        value={priceRange}
                        onChangeText={setPriceRange}
                    />

                    {/* Availability */}
                    <Text style={styles.label}>Availability</Text>
                    <View style={styles.chipsRow}>
                        {(['Available', 'Busy', 'Paused'] as const).map(status => {
                            const colors = {
                                Available: { active: COLORS.success, bg: '#E8F5E9' },
                                Busy: { active: '#FF9800', bg: '#FFF3E0' },
                                Paused: { active: '#EF5350', bg: '#FFEBEE' },
                            };
                            const isActive = availability === status;
                            return (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.availChip,
                                        { backgroundColor: isActive ? colors[status].active : colors[status].bg }
                                    ]}
                                    onPress={() => setAvailability(status)}
                                >
                                    <Text style={[
                                        styles.availChipText,
                                        { color: isActive ? COLORS.white : colors[status].active }
                                    ]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Description */}
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell customers about yourself, your expertise, and why they should hire you..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    {/* Submit */}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.white} />
                        <Text style={styles.submitButtonText}>Create Service Profile</Text>
                    </TouchableOpacity>

                    <View style={{ height: SPACING.xl }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3FF',
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
        backgroundColor: '#F0E6FF',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    bannerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondary,
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
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    categoryCard: {
        width: '30%',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 6,
    },
    categoryCardActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    categoryCardText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    categoryCardTextActive: {
        color: COLORS.white,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    areaChip: {
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
    skillChip: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    skillChipActive: {
        backgroundColor: '#F0E6FF',
        borderColor: COLORS.secondary,
    },
    skillChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    skillChipTextActive: {
        color: COLORS.secondary,
    },
    availChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
    },
    availChipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary,
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
});
