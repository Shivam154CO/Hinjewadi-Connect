import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { aiService } from '../../services/aiService';
import { COLORS, SHADOWS } from '../../theme/theme';

interface Props {
    skills: string[];
    jobDescription: string;
}

export const AIJobMatchCard = ({ skills, jobDescription }: Props) => {
    const [score, setScore] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleAnalyze = async () => {
        setLoading(true);
        const result = await aiService.evaluateJobMatch(skills, jobDescription);
        setScore(result.score);
        setFeedback(result.feedback);
        setLoading(false);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    if (score === null && !loading) {
        return (
            <TouchableOpacity style={styles.btn} onPress={handleAnalyze}>
                <MaterialCommunityIcons name="brain" size={20} color="#FFFFFF" />
                <Text style={styles.btnText}>Calculate AI Match Score</Text>
            </TouchableOpacity>
        );
    }

    if (loading) {
        return (
            <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>AI is reading your profile...</Text>
            </View>
        );
    }

    const getColor = (s: number) => s > 75 ? '#10B981' : s > 50 ? '#F59E0B' : '#EF4444';

    return (
        <Animated.View style={[styles.card, { borderColor: getColor(score!) + '30', opacity: fadeAnim }]}>
            <View style={styles.header}>
                <View style={[styles.scoreCircle, { backgroundColor: getColor(score!) + '15' }]}>
                    <Text style={[styles.scoreText, { color: getColor(score!) }]}>{score}%</Text>
                </View>
                <Text style={styles.title}>AI Compatibility</Text>
            </View>
            <Text style={styles.feedback}>{feedback}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    btn: { backgroundColor: '#4F46E5', padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 12, ...SHADOWS.light },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    loadingBox: { padding: 24, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, marginVertical: 12 },
    loadingText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
    card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 2, marginVertical: 12 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    scoreCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    scoreText: { fontSize: 16, fontWeight: '900' },
    title: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    feedback: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
