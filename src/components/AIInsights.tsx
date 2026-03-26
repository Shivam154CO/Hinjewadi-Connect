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
import { SHADOWS } from '../theme/theme';
import { useTranslation } from 'react-i18next';

export const AIInsights: React.FC = () => {
    const { t } = useTranslation();
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const data = await aiService.getInsights();
                setInsights(data);
            } catch (error) {
                console.error('Insights Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <View style={styles.card}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.loadingText}>Analyzing Hinjewadi data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="brain" size={20} color="#4F46E5" />
                <Text style={styles.title}>{t('ai_insights')}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>BETA</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {insights.map((insight) => (
                    <TouchableOpacity key={insight.id} style={styles.insightCard} activeOpacity={0.8}>
                        <View style={[styles.iconBox, { backgroundColor: getPriorityColor(insight.priority) + '15' }]}>
                            <MaterialCommunityIcons 
                                name={insight.icon as any} 
                                size={22} 
                                color={getPriorityColor(insight.priority)} 
                            />
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.insightTitle} numberOfLines={1}>{insight.title}</Text>
                            <Text style={styles.insightDesc} numberOfLines={2}>{insight.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return '#EF4444';
        case 'medium': return '#F59E0B';
        default: return '#10B981';
    }
}

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
    title: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginLeft: 8 },
    badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
    badgeText: { fontSize: 10, fontWeight: '900', color: '#4F46E5' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 12, fontSize: 13, color: '#64748B', fontWeight: '600' },
    scroll: { gap: 12, paddingRight: 20 },
    insightCard: {
        width: 260,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        ...SHADOWS.light,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1 },
    insightTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
    insightDesc: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },
});
