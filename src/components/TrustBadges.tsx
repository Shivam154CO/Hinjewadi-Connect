import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme/theme';
import { VerificationStatus } from '../types';
import { getTrustLabel } from '../utils/trustSafetyUtils';

/**
 * Trust & Verification UI Badges
 */

// ── Verified Badge (small inline) ──
interface VerifiedBadgeProps {
    status: VerificationStatus;
    size?: 'sm' | 'md' | 'lg';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ status, size = 'sm' }) => {
    if (status === 'unverified') return null;

    const config = {
        pending: { icon: 'clock-outline', color: '#F59E0B', bg: '#FFF8E1', label: 'Pending' },
        verified: { icon: 'check-decagram', color: '#10B981', bg: '#E8F5E9', label: 'Verified' },
        rejected: { icon: 'close-circle-outline', color: '#EF4444', bg: '#FFEBEE', label: 'Rejected' },
    }[status];

    const sizes = {
        sm: { icon: 14, font: 10, px: 6, py: 2 },
        md: { icon: 16, font: 12, px: 8, py: 3 },
        lg: { icon: 20, font: 14, px: 12, py: 5 },
    }[size];

    return (
        <View style={[
            styles.verifiedBadge,
            { backgroundColor: config.bg, paddingHorizontal: sizes.px, paddingVertical: sizes.py }
        ]}>
            <MaterialCommunityIcons name={config.icon as any} size={sizes.icon} color={config.color} />
            {size !== 'sm' && (
                <Text style={[styles.verifiedText, { fontSize: sizes.font, color: config.color }]}>
                    {config.label}
                </Text>
            )}
        </View>
    );
};

// ── Verified checkmark (just an icon, for inline use next to names) ──
interface VerifiedCheckProps {
    verified: boolean;
    size?: number;
}

export const VerifiedCheck: React.FC<VerifiedCheckProps> = ({ verified, size = 16 }) => {
    if (!verified) return null;
    return (
        <MaterialCommunityIcons
            name="check-decagram"
            size={size}
            color="#10B981"
            style={{ marginLeft: 4 }}
        />
    );
};

// ── Trust Score Badge ──
interface TrustScoreBadgeProps {
    score: number;
    showLabel?: boolean;
    size?: 'sm' | 'md';
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({ score, showLabel = true, size = 'sm' }) => {
    const trust = getTrustLabel(score);

    return (
        <View style={[
            styles.trustBadge,
            { backgroundColor: trust.color + '15' },
            size === 'md' && styles.trustBadgeMd,
        ]}>
            <MaterialCommunityIcons
                name={trust.icon as any}
                size={size === 'md' ? 18 : 14}
                color={trust.color}
            />
            <Text style={[
                styles.trustScore,
                { color: trust.color },
                size === 'md' && { fontSize: 13 },
            ]}>
                {score}
            </Text>
            {showLabel && (
                <Text style={[
                    styles.trustLabel,
                    { color: trust.color },
                    size === 'md' && { fontSize: 11 },
                ]}>
                    {trust.label}
                </Text>
            )}
        </View>
    );
};

// ── Star Rating Component (reusable) ──
interface StarRatingProps {
    rating: number;
    size?: number;
    interactive?: boolean;
    onRate?: (rating: number) => void;
    showValue?: boolean;
    totalRatings?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    size = 18,
    interactive = false,
    onRate,
    showValue = false,
    totalRatings,
}) => (
    <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
                key={star}
                disabled={!interactive}
                onPress={() => onRate?.(star)}
            >
                <MaterialCommunityIcons
                    name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half-full' : 'star-outline'}
                    size={size}
                    color={star <= Math.ceil(rating) ? '#FFB800' : '#D1D5DB'}
                />
            </TouchableOpacity>
        ))}
        {showValue && (
            <Text style={[styles.starValue, { fontSize: size * 0.8 }]}>{rating.toFixed(1)}</Text>
        )}
        {totalRatings !== undefined && (
            <Text style={styles.totalRatings}>({totalRatings})</Text>
        )}
    </View>
);

// ── Trust Info Card (for detail screens / profiles) ──
interface TrustInfoCardProps {
    verificationStatus: VerificationStatus;
    trustScore: number;
    totalReviews: number;
    averageRating: number;
    joinedAt: string;
    onVerify?: () => void;
}

export const TrustInfoCard: React.FC<TrustInfoCardProps> = ({
    verificationStatus,
    trustScore,
    totalReviews,
    averageRating,
    joinedAt,
    onVerify,
}) => {
    const monthsAgo = Math.floor(
        (Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const trust = getTrustLabel(trustScore);

    return (
        <View style={styles.trustCard}>
            <View style={styles.trustCardHeader}>
                <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.primary} />
                <Text style={styles.trustCardTitle}>Trust & Verification</Text>
            </View>

            {/* Trust Score Bar */}
            <View style={styles.trustBarContainer}>
                <View style={styles.trustBarBg}>
                    <View style={[
                        styles.trustBarFill,
                        { width: `${trustScore}%`, backgroundColor: trust.color },
                    ]} />
                </View>
                <View style={styles.trustBarLabels}>
                    <Text style={[styles.trustBarScore, { color: trust.color }]}>
                        {trustScore}/100 · {trust.label}
                    </Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.trustStats}>
                <View style={styles.trustStat}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
                    <Text style={styles.trustStatValue}>{averageRating.toFixed(1)}</Text>
                    <Text style={styles.trustStatLabel}>Rating</Text>
                </View>
                <View style={styles.trustStatDivider} />
                <View style={styles.trustStat}>
                    <MaterialCommunityIcons name="comment-text-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.trustStatValue}>{totalReviews}</Text>
                    <Text style={styles.trustStatLabel}>Reviews</Text>
                </View>
                <View style={styles.trustStatDivider} />
                <View style={styles.trustStat}>
                    <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.secondary} />
                    <Text style={styles.trustStatValue}>{monthsAgo}mo</Text>
                    <Text style={styles.trustStatLabel}>Member</Text>
                </View>
            </View>

            {/* Verification Status */}
            <View style={styles.verificationRow}>
                <VerifiedBadge status={verificationStatus} size="md" />
                {verificationStatus === 'unverified' && onVerify && (
                    <TouchableOpacity style={styles.verifyBtn} onPress={onVerify}>
                        <MaterialCommunityIcons name="shield-plus" size={16} color={COLORS.white} />
                        <Text style={styles.verifyBtnText}>Get Verified</Text>
                    </TouchableOpacity>
                )}
                {verificationStatus === 'verified' && (
                    <Text style={styles.verifiedByText}>Verified by Admin</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Verified Badge
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    verifiedText: {
        fontWeight: '700',
    },
    // Trust Badge
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    trustBadgeMd: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    trustScore: {
        fontSize: 11,
        fontWeight: '800',
    },
    trustLabel: {
        fontSize: 9,
        fontWeight: '600',
    },
    // Star Rating
    starRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    starValue: {
        fontWeight: '700',
        color: '#F59E0B',
        marginLeft: 4,
    },
    totalRatings: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    // Trust Info Card
    trustCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.md,
    },
    trustCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trustCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    trustBarContainer: {
        gap: 4,
    },
    trustBarBg: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
    },
    trustBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    trustBarLabels: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    trustBarScore: {
        fontSize: 12,
        fontWeight: '700',
    },
    trustStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#F8FAFC',
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.sm,
    },
    trustStat: {
        alignItems: 'center',
        gap: 2,
    },
    trustStatValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    trustStatLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    trustStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    },
    verificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    verifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        gap: 6,
    },
    verifyBtnText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    verifiedByText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
