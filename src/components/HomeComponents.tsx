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

export const CategoryItem = ({ title, icon, color = COLORS.primary, onPress }: CategoryItemProps) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.categoryIcon, { backgroundColor: color }]}>
            <MaterialCommunityIcons name={icon as any} size={22} color="#FFFFFF" />
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
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.cardImagePlaceholder}>
            <MaterialCommunityIcons name="home-city-outline" size={40} color="#C7C7CC" />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.cardArea}>{area}</Text>
            <Text style={styles.cardPrice}>{price}<Text style={styles.cardPriceSuffix}>/mo</Text></Text>
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
    <TouchableOpacity style={styles.jobMiniCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.jobIcon}>
            <MaterialCommunityIcons name="briefcase-outline" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.jobTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.jobCompany} numberOfLines={1}>{company}</Text>
        <Text style={styles.jobSalary}>{salary}</Text>
    </TouchableOpacity>
);

interface ActionCardProps {
    title: string;
    subtitle: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
    onPress: () => void;
}

export const ActionCard = ({ title, subtitle, icon, color = COLORS.primary, onPress }: ActionCardProps) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.actionIcon, { backgroundColor: color }]}>
            <MaterialCommunityIcons name={icon as any} size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.actionCardTitle}>{title}</Text>
            <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color="#C7C7CC" />
    </TouchableOpacity>
);

interface BigActionBtnProps {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
    onPress: () => void;
}

export const BigActionBtn = ({ title, icon, color = COLORS.primary, onPress }: BigActionBtnProps) => (
    <TouchableOpacity style={[styles.bigActionBtn, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.85}>
        <MaterialCommunityIcons name={icon as any} size={28} color="#FFFFFF" />
        <Text style={styles.bigActionBtnText}>{title}</Text>
    </TouchableOpacity>
);

interface StatCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
}

export const StatCard = ({ label, value, icon, color = COLORS.primary }: StatCardProps) => (
    <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        </View>
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
        width: 58, height: 58, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
        ...SHADOWS.light,
    },
    categoryTitle: { fontSize: 12, fontWeight: '600', color: '#3C3C43', textAlign: 'center' },

    // Featured Card
    featuredCard: {
        width: 200, backgroundColor: '#FFFFFF', borderRadius: 18,
        overflow: 'hidden', ...SHADOWS.medium,
    },
    cardImagePlaceholder: {
        width: '100%', height: 110, backgroundColor: '#F2F2F7',
        alignItems: 'center', justifyContent: 'center',
    },
    cardContent: { padding: 12 },
    cardTitle: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 3 },
    cardArea: { fontSize: 12, color: '#8E8E93', marginBottom: 6 },
    cardPrice: { fontSize: 16, fontWeight: '700', color: '#007AFF' },
    cardPriceSuffix: { fontSize: 11, fontWeight: '400', color: '#8E8E93' },

    // Job Mini
    jobMiniCard: {
        width: 170, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 18,
        ...SHADOWS.medium,
    },
    jobIcon: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: '#E5F0FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    jobTitle: { fontSize: 14, fontWeight: '600', color: '#000000', lineHeight: 20 },
    jobCompany: { fontSize: 12, color: '#8E8E93', marginTop: 3 },
    jobSalary: { fontSize: 14, fontWeight: '700', color: '#007AFF', marginTop: 10 },

    // Stat Card
    statCard: {
        flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF',
        padding: 14, borderRadius: 14, alignItems: 'center', ...SHADOWS.light,
    },
    statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: '#000000' },
    statLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '500', marginTop: 1 },

    // Big Action
    bigActionBtn: {
        flex: 1, borderRadius: 18, padding: 18,
        alignItems: 'center', justifyContent: 'center', gap: 10,
        ...SHADOWS.medium,
    },
    bigActionBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14, textAlign: 'center' },

    // Action Card
    actionCard: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: '#FFFFFF', borderRadius: 14, ...SHADOWS.light,
    },
    actionIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    actionCardTitle: { fontSize: 15, fontWeight: '600', color: '#000000' },
    actionCardSubtitle: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
});
