import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { Room } from '../types';

interface CategoryItemProps {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
    onPress: () => void;
}

export const CategoryItem = ({ title, icon, onPress }: CategoryItemProps) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name={icon as any} size={24} color={COLORS.text} />
        </View>
        <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
);

interface FeaturedCardProps {
    title: string;
    price: string;
    area: string;
    item?: Room;
    onPress: () => void;
}

export const FeaturedCard = ({ title, price, area, onPress }: FeaturedCardProps) => (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.cardImagePlaceholder}>
            <MaterialCommunityIcons name="home-city-outline" size={36} color="#D1D5DB" />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{price}<Text style={styles.cardPriceSuffix}>/mo</Text></Text>
                <View style={styles.cardAreaBadge}>
                    <Text style={styles.cardArea}>{area}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

interface JobMiniCardProps {
    title: string;
    company: string;
    salary: string;
    onPress: () => void;
}

export const JobMiniCard = ({ title, company, salary, onPress }: JobMiniCardProps) => (
    <TouchableOpacity style={styles.jobMiniCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.jobIcon}>
            <MaterialCommunityIcons name="briefcase-outline" size={20} color={COLORS.text} />
        </View>
        <Text style={styles.jobTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.jobCompany} numberOfLines={1}>{company}</Text>
        <View style={styles.jobSalaryRow}>
            <Text style={styles.jobSalary}>{salary}</Text>
        </View>
    </TouchableOpacity>
);

interface ActionCardProps {
    title: string;
    subtitle: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
    onPress: () => void;
}

export const ActionCard = ({ title, subtitle, icon, onPress }: ActionCardProps) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.actionIcon}>
            <MaterialCommunityIcons name={icon as any} size={22} color={COLORS.text} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.actionCardTitle}>{title}</Text>
            <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
);

interface BigActionBtnProps {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
    onPress: () => void;
}

export const BigActionBtn = ({ title, icon, onPress }: BigActionBtnProps) => (
    <TouchableOpacity style={styles.bigActionBtn} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.bigActionIcon}>
            <MaterialCommunityIcons name={icon as any} size={26} color={COLORS.text} />
        </View>
        <Text style={styles.bigActionBtnText}>{title}</Text>
    </TouchableOpacity>
);

interface StatCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
}

export const StatCard = ({ label, value, icon }: StatCardProps) => (
    <View style={styles.statCard}>
        <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.accent} />
        <View style={{ marginLeft: 12 }}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    // Category
    categoryItem: { alignItems: 'center', flex: 1 },
    categoryIcon: {
        width: 56, height: 56, borderRadius: 14,
        backgroundColor: '#F3F4F6',
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

    // Featured Card
    featuredCard: {
        width: 210, backgroundColor: '#FFFFFF', borderRadius: 14,
        borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', ...SHADOWS.light
    },
    cardImagePlaceholder: {
        width: '100%', height: 110,
        backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center',
    },
    cardContent: { padding: 12 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.text },
    cardPriceSuffix: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted },
    cardAreaBadge: {
        backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    cardArea: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

    // Job Mini Card
    jobMiniCard: {
        width: 170, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14,
        borderWidth: 1, borderColor: '#E5E7EB', ...SHADOWS.light
    },
    jobIcon: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    jobTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
    jobCompany: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
    jobSalaryRow: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
    jobSalary: { fontSize: 13, fontWeight: '800', color: COLORS.text },

    // Stat Card
    statCard: {
        flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF',
        padding: 14, borderRadius: 12, borderWidth: 1,
        borderColor: '#E5E7EB', alignItems: 'center', ...SHADOWS.light
    },
    statValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginTop: 1 },

    // Big Action
    bigActionBtn: {
        flex: 1, backgroundColor: '#F9FAFB', borderRadius: 14,
        padding: 18, borderWidth: 1, borderColor: '#E5E7EB', ...SHADOWS.light,
    },
    bigActionIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB',
    },
    bigActionBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 14, lineHeight: 20 },

    // Action Card
    actionCard: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: '#FFFFFF', borderRadius: 12,
        borderWidth: 1, borderColor: '#E5E7EB', ...SHADOWS.light
    },
    actionIcon: {
        width: 42, height: 42, borderRadius: 10,
        backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    },
    actionCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    actionCardSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
});
