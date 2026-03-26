import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/supabaseClient';
import { ServiceCategory, MainStackScreenProps } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CATEGORIES: { key: ServiceCategory; icon: string }[] = [
    { key: 'Maid', icon: 'broom' },
    { key: 'Cook', icon: 'chef-hat' },
    { key: 'Cleaner', icon: 'vacuum' },
    { key: 'Laundry', icon: 'tshirt-crew' },
    { key: 'Driver', icon: 'car-steering-wheel' },
];

const PHASES = ['Phase 1', 'Phase 2', 'Phase 3'];
const SKILLS_MAP: Record<ServiceCategory, string[]> = {
    Maid: ['Cleaning', 'Dusting', 'Utensils', 'Ironing', 'Babysitting'],
    Cook: ['Veg', 'Non-Veg', 'South Indian', 'Chinese', 'Breakfast only'],
    Cleaner: ['Deep Clean', 'Bathroom', 'Kitchen', 'Sofa/Carpet', 'Windows'],
    Laundry: ['Wash & Fold', 'Ironing', 'Dry Clean', 'Pick & Drop'],
    Driver: ['Local', 'Highway', 'Automatic', 'Manual', 'Luxury Cars'],
};

const CreateServiceProfileScreen: React.FC<MainStackScreenProps<'CreateServiceProfile'>> = ({ navigation }) => {
    const { user, updateProfile } = useAuth();
    const [category, setCategory] = useState<ServiceCategory>('Maid');
    const [experience, setExperience] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState('');
    const [selectedPhases, setSelectedPhases] = useState<string[]>(user?.area ? [user.area] : ['Phase 1']);
    const [loading, setLoading] = useState(false);

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev => 
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const togglePhase = (phase: string) => {
        setSelectedPhases(prev => 
            prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
        );
    };

    const handleSave = async () => {
        if (!user) return;
        if (!experience || !priceRange || selectedPhases.length === 0) {
            Alert.alert('Missing Info', 'Please fill in experience, price, and at least one area.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('service_providers').upsert({
                user_id: user.id,
                name: user.name,
                phone: user.phone,
                category,
                experience,
                skills: selectedSkills,
                price_range: priceRange,
                areas: selectedPhases,
                availability: 'Available',
            });

            if (error) throw error;

            // Also update main user profile to reflect they have a worker profile
            await updateProfile({ availability: 'Available' });

            Alert.alert('Success 🎉', 'Your service profile is now active!', [
                { text: 'Awesome', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Professional Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Text style={styles.sectionTitle}>I am a Professional...</Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map(c => (
                        <TouchableOpacity
                            key={c.key}
                            style={[styles.catCard, category === c.key && styles.catCardActive]}
                            onPress={() => {
                                setCategory(c.key);
                                setSelectedSkills([]);
                            }}
                        >
                            <MaterialCommunityIcons 
                                name={c.icon as any} 
                                size={28} 
                                color={category === c.key ? COLORS.white : COLORS.primary} 
                            />
                            <Text style={[styles.catText, category === c.key && styles.catTextActive]}>
                                {c.key}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.formSection}>
                    <AppTextInput
                        label="Experience (e.g. 5+ years)"
                        placeholder="How long have you been doing this?"
                        value={experience}
                        onChangeText={setExperience}
                    />
                    
                    <AppTextInput
                        label="Expected Monthly Salary / Rate"
                        placeholder="e.g. ₹5,000 - ₹7,000"
                        value={priceRange}
                        onChangeText={setPriceRange}
                    />

                    <Text style={styles.label}>My Skills</Text>
                    <View style={styles.chipStack}>
                        {SKILLS_MAP[category].map(skill => (
                            <TouchableOpacity
                                key={skill}
                                style={[styles.skillChip, selectedSkills.includes(skill) && styles.skillChipActive]}
                                onPress={() => toggleSkill(skill)}
                            >
                                <Text style={[styles.skillChipText, selectedSkills.includes(skill) && styles.skillChipTextActive]}>
                                    {skill}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: SPACING.lg }]}>Areas I Serve</Text>
                    <View style={styles.chipStack}>
                        {PHASES.map(p => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.areaChip, selectedPhases.includes(p) && styles.areaChipActive]}
                                onPress={() => togglePhase(p)}
                            >
                                <MaterialCommunityIcons 
                                    name={selectedPhases.includes(p) ? "check-circle" : "circle-outline"} 
                                    size={16} 
                                    color={selectedPhases.includes(p) ? COLORS.white : COLORS.textSecondary} 
                                />
                                <Text style={[styles.areaChipText, selectedPhases.includes(p) && styles.areaChipTextActive]}>
                                    {p}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <PrimaryButton 
                    title="Activate My Profile" 
                    onPress={handleSave} 
                    loading={loading}
                    style={styles.saveButton} 
                />
                
                <View style={styles.footer}>
                    <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.success} />
                    <Text style={styles.footerText}>Verified profiles get 3x more bookings</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateServiceProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    scroll: { padding: SPACING.lg },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.xl },
    catCard: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    catCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 8 },
    catTextActive: { color: COLORS.white },
    formSection: { gap: SPACING.md },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    chipStack: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    skillChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
    skillChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    skillChipTextActive: { color: COLORS.primary, fontWeight: '700' },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 6,
    },
    areaChipActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    areaChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    areaChipTextActive: { color: COLORS.white },
    saveButton: { marginTop: SPACING.xl, ...SHADOWS.medium },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg, gap: 6 },
    footerText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
});
