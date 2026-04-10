import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { aiService } from '../../services/aiService';
import { COLORS } from '../../theme/theme';

interface Props {
    area: string;
    type: string;
    furnishing: string;
}

export const AIRentEstimator = ({ area, type, furnishing }: Props) => {
    const [estimate, setEstimate] = useState<number | null>(null);
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const checkValue = async () => {
        setLoading(true);
        const result = await aiService.estimateFairRent(area, type, furnishing);
        setEstimate(result.estimate);
        setAdvice(result.advice);
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator color={COLORS.primary} />
            ) : estimate ? (
                <View>
                    <View style={styles.row}>
                        <MaterialCommunityIcons name="check-decagram" size={20} color="#10B981" />
                        <Text style={styles.title}>AI Fair Rent Estimate: ₹{estimate.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.advice}>{advice}</Text>
                </View>
            ) : (
                <TouchableOpacity style={styles.trigger} onPress={checkValue}>
                    <MaterialCommunityIcons name="magic-staff" size={20} color="#8B5CF6" />
                    <Text style={styles.triggerText}>Estimate Market Value with AI</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#F5F3FF', padding: 16, borderRadius: 16, marginVertical: 12, borderWidth: 1, borderColor: '#DDD6FE' },
    trigger: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    triggerText: { color: '#6D28D9', fontWeight: '800' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    title: { color: '#1E293B', fontWeight: '800', fontSize: 15 },
    advice: { color: '#4c1d95', fontSize: 13, lineHeight: 18 }
});
