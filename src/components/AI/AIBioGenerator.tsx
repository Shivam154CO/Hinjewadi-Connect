import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { aiService } from '../../services/aiService';
import { COLORS } from '../../theme/theme';

interface Props {
    role: string;
    category: string;
    experience: string;
    onGenerate: (bio: string) => void;
}

export const AIBioGenerator = ({ role, category, experience, onGenerate }: Props) => {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        const autoBio = await aiService.generateProfessionalBio(role, category, experience);
        onGenerate(autoBio);
        setLoading(false);
    };

    return (
        <TouchableOpacity 
            style={styles.magicBtn} 
            onPress={handleGenerate} 
            disabled={loading || !category}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <>
                    <MaterialCommunityIcons name="auto-fix" size={18} color="#FFFFFF" />
                    <Text style={styles.magicText}>Write my Bio with AI</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    magicBtn: {
        backgroundColor: '#8B5CF6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
    },
    magicText: { color: '#FFFFFF', fontWeight: 'bold' }
});
