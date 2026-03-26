import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { Room } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RoomCardProps {
    room: Room;
    onPress: (id: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
    const [saved, setSaved] = useState(false);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(room.id)}
            activeOpacity={0.95}
        >
            {/* Image Section */}
            <View style={styles.imageContainer}>
                {room.images && room.images.length > 0 ? (
                    <Image source={{ uri: room.images[0] }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons name="home-city" size={48} color="#CBD5E1" />
                        <Text style={styles.placeholderText}>Photos coming soon</Text>
                    </View>
                )}

                {/* Overlays */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.badgeContainer}>
                    <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={14} color="#FFFFFF" />
                        <Text style={styles.verifiedText}>VERIFIED</Text>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: room.type === 'PG' ? '#8B5CF6' : '#4F46E5' }]}>
                        <Text style={styles.typeText}>{room.type}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        setSaved(!saved);
                    }}
                >
                    <MaterialCommunityIcons
                        name={saved ? "heart" : "heart-outline"}
                        size={22}
                        color={saved ? '#FF4B4B' : '#FFFFFF'}
                    />
                </TouchableOpacity>

                <View style={styles.priceOverlay}>
                    <Text style={styles.priceSymbol}>₹</Text>
                    <Text style={styles.priceAmount}>{room.price.toLocaleString()}</Text>
                    <Text style={styles.priceUnit}>/mo</Text>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                <View style={styles.mainInfo}>
                    <Text style={styles.title} numberOfLines={1}>{room.title}</Text>
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.primary} />
                        <Text style={styles.locationText}>{room.area}, Pune</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="chair-rolling" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{room.furnishing}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="account-group-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{room.genderPreference === 'Any' ? 'Any' : room.genderPreference}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.ratingText}>4.8</Text>
                    </View>
                </View>

                <View style={styles.amenitiesContainer}>
                    {room.amenities.slice(0, 3).map((amt, idx) => (
                        <View key={idx} style={styles.amenityChip}>
                            <Text style={styles.amenityText}>{amt}</Text>
                        </View>
                    ))}
                    {room.amenities.length > 3 && (
                        <Text style={styles.moreAmenity}>+{room.amenities.length - 3}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...SHADOWS.medium,
    },
    imageContainer: {
        width: '100%',
        height: 190,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 8,
    },
    badgeContainer: {
        position: 'absolute',
        top: 14,
        left: 14,
        flexDirection: 'row',
        gap: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    verifiedText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
    },
    heartButton: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceOverlay: {
        position: 'absolute',
        bottom: 14,
        left: 14,
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceSymbol: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 2,
    },
    priceAmount: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
    },
    priceUnit: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 2,
    },
    content: {
        padding: 16,
    },
    mainInfo: {
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 12,
        marginBottom: 14,
    },
    detailItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1E293B',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: '#E2E8F0',
    },
    amenitiesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    amenityChip: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    amenityText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4F46E5',
    },
    moreAmenity: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        marginLeft: 4,
    },
});
