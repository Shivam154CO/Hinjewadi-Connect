import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { Room } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RoomCardProps {
    room: Room;
    onPress: (id: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
    const [saved, setSaved] = useState(false);

    return (
        <TouchableOpacity
            style={[styles.card, SHADOWS.light]}
            onPress={() => onPress(room.id)}
            activeOpacity={0.92}
        >
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="home-city" size={50} color={COLORS.border} />
                </View>

                {/* Verified Badge */}
                <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.white} />
                    <Text style={styles.verifiedText}>Verified</Text>
                </View>

                {/* Save/Heart Button */}
                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={(e) => {
                        e.stopPropagation?.();
                        setSaved(!saved);
                    }}
                >
                    <MaterialCommunityIcons
                        name={saved ? "heart" : "heart-outline"}
                        size={22}
                        color={saved ? '#FF4081' : COLORS.white}
                    />
                </TouchableOpacity>

                {/* Type badge */}
                <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{room.type}</Text>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                {/* Title + Rating */}
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>{room.title}</Text>
                    <View style={styles.ratingBadge}>
                        <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
                        <Text style={styles.ratingText}>4.5</Text>
                    </View>
                </View>

                {/* Info chips */}
                <View style={styles.infoRow}>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoChipText}>{room.area}</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoChipText}>{room.furnishing}</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.infoChipText}>0.5 km</Text>
                    </View>
                </View>

                {/* Amenities */}
                <View style={styles.amenities}>
                    {room.amenities.slice(0, 3).map((item, index) => (
                        <View key={index} style={styles.amenityChip}>
                            <Text style={styles.amenityText}>{item}</Text>
                        </View>
                    ))}
                    {room.amenities.length > 3 && (
                        <Text style={styles.moreText}>+{room.amenities.length - 3}</Text>
                    )}
                </View>

                {/* Price */}
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Monthly Rent</Text>
                    <Text style={styles.priceValue}>₹{room.price.toLocaleString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    imageContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F4F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedBadge: {
        position: 'absolute',
        top: SPACING.md,
        left: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    verifiedText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },
    heartButton: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeBadge: {
        position: 'absolute',
        bottom: SPACING.sm,
        left: SPACING.md,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    typeBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    content: {
        padding: SPACING.md,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
        marginRight: SPACING.sm,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F59E0B',
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: SPACING.sm,
    },
    infoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7F4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    infoChipText: {
        fontSize: 11,
        color: COLORS.success,
        fontWeight: '600',
    },
    amenities: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: SPACING.md,
    },
    amenityChip: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    amenityText: {
        fontSize: 11,
        color: COLORS.text,
        fontWeight: '600',
    },
    moreText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        alignSelf: 'center',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
    },
    priceLabel: {
        fontSize: 13,
        color: COLORS.success,
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
});
