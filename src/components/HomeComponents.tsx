import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { Room } from '../types';

interface CategoryItemProps {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    onPress: () => void;
}

export const CategoryItem = ({ title, icon, color, onPress }: CategoryItemProps) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
        <View style={[styles.categoryIcon, { backgroundColor: color + '10' }]}>
            <MaterialCommunityIcons name={icon as any} size={28} color={color} />
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
    <TouchableOpacity style={styles.featuredCard} onPress={onPress}>
        <View style={styles.cardImagePlaceholder}>
            <MaterialCommunityIcons name="home-city-outline" size={40} color={COLORS.border} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{price}</Text>
                <Text style={styles.cardArea}>{area}</Text>
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
    <TouchableOpacity style={styles.jobMiniCard} onPress={onPress}>
        <View style={styles.jobIcon}>
            <MaterialCommunityIcons name="briefcase-outline" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.jobTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.jobCompany} numberOfLines={1}>{company}</Text>
        <Text style={styles.jobSalary}>{salary}</Text>
    </TouchableOpacity>
);

interface ActionCardProps {
    title: string;
    subtitle: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    onPress: () => void;
}

export const ActionCard = ({ title, subtitle, icon, color, onPress }: ActionCardProps) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: color + '10' }]}>
            <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.actionCardTitle}>{title}</Text>
            <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.border} />
    </TouchableOpacity>
);

interface BigActionBtnProps {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    onPress: () => void;
}

export const BigActionBtn = ({ title, icon, color, onPress }: BigActionBtnProps) => (
    <TouchableOpacity style={[styles.bigActionBtn, { backgroundColor: color }]} onPress={onPress}>
        <MaterialCommunityIcons name={icon as any} size={32} color={COLORS.white} />
        <Text style={styles.bigActionBtnText}>{title}</Text>
    </TouchableOpacity>
);

interface StatCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
}

export const StatCard = ({ label, value, icon, color }: StatCardProps) => (
    <View style={styles.statCard}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
        <View style={{ marginLeft: 12 }}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    categoryItem: { alignItems: 'center', width: '22%' },
    categoryIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    categoryTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
    
    featuredCard: { width: 220, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.light },
    cardImagePlaceholder: { width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
    cardContent: { padding: 12 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
    cardPrice: { fontSize: 16, fontWeight: '800', color: COLORS.success },
    cardArea: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

    jobMiniCard: { width: 180, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.light },
    jobIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    jobTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    jobCompany: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    jobSalary: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginTop: 8 },

    statCard: { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', ...SHADOWS.light },
    statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    
    bigActionBtn: { flex: 1, height: 120, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
    bigActionBtnText: { color: '#FFFFFF', fontWeight: '800', marginTop: 8, fontSize: 14 },
    
    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.light },
    actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionCardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    actionCardSubtitle: { fontSize: 13, color: COLORS.textSecondary },
});
