import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { aiService, AIInsight } from '../services/aiService';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, SHADOWS } from '../theme/theme';

export const AIInsights: React.FC = () => {
    const { t } = useTranslation();
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        aiService.getInsights().then(setInsights).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading insights…</Text>
            </View>
        );
    }

    if (!insights.length) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionLabel}>Market Insights</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {insights.map((insight) => (
                    <TouchableOpacity key={insight.id} style={styles.card} activeOpacity={0.8}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons
                                name={insight.icon as any}
                                size={18}
                                color={COLORS.primary}
                            />
                        </View>
                        <Text style={styles.cardTitle} numberOfLines={1}>{insight.title}</Text>
                        <Text style={styles.cardDesc} numberOfLines={3}>{insight.description}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 28 },
    sectionLabel: {
        fontSize: 12, fontWeight: '700', color: COLORS.textMuted,
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
        paddingHorizontal: 20,
    },
    loadingCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: COLORS.surface, borderRadius: 12,
        padding: 14, marginHorizontal: 20, marginBottom: 28,
        borderWidth: 1, borderColor: COLORS.border,
    },
    loadingText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: FONTS.regular },
    scroll: { gap: 12, paddingHorizontal: 20 },
    card: {
        width: 200,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.soft,
    },
    iconBox: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    cardTitle: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: COLORS.text, 
        marginBottom: 6,
        fontFamily: FONTS.bold,
    },
    cardDesc: { 
        fontSize: 12, 
        color: COLORS.textSecondary, 
        lineHeight: 18,
        fontFamily: FONTS.regular,
    },
});
