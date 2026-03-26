import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/supabaseClient';
import { ServiceCategory } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';

const CATEGORIES: ServiceCategory[] = ['Maid', 'Cook', 'Cleaner', 'Laundry', 'Driver'];

const CreateServiceProfileScreen: React.FC = () => {
    const { user } = useAuth();
    const [category, setCategory] = useState<ServiceCategory>('Maid');
    const [experience, setExperience] = useState('');
    const [skills, setSkills] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [area, setArea] = useState<'Phase 1' | 'Phase 2' | 'Phase 3'>('Phase 1');

    const save = async () => {
        if (!user) return;
        const { error } = await supabase.from('service_providers').upsert({
            user_id: user.id,
            name: user.name,
            phone: user.phone,
            category,
            experience,
            skills: skills.split(',').map(s => s.trim()).filter(s => s),
            price_range: priceRange,
            areas: [area],
            availability: 'Available',
        });
        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Saved');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.label}>Service category</Text>
                <View style={styles.chipContainer}>
                    {CATEGORIES.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[styles.chip, category === c && styles.chipActive]}
                            onPress={() => setCategory(c)}
                        >
                            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                                {c}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <AppTextInput
                    label="Experience"
                    value={experience}
                    onChangeText={setExperience}
                />
                <AppTextInput
                    label="Skills (comma separated)"
                    value={skills}
                    onChangeText={setSkills}
                />
                <AppTextInput
                    label="Price range"
                    value={priceRange}
                    onChangeText={setPriceRange}
                />
                <PrimaryButton title="Save" onPress={save} style={styles.saveButton} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateServiceProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: SPACING.lg },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
    chipTextActive: { color: COLORS.white },
    saveButton: { marginTop: SPACING.lg },
});
